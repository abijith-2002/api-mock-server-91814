const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const { buildAbsoluteUrl } = require('./utils/url');

// Initialize express app
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Trust proxy so protocol/host are detected correctly behind proxies
app.set('trust proxy', true);

// Serve Swagger UI with dynamic server URL reflecting current request
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host'); // may or may not include port
  let protocol = req.protocol;

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
      (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  // Detect proxy prefix from the incoming request
  const originalUrl = req.originalUrl || '';
  const proxyMatch = originalUrl.match(/^\/proxy\/\d{2,5}(?=\/|$)/i);
  const proxyPrefix = proxyMatch ? proxyMatch[0] : '';

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        // Include proxy prefix so that "Try it out" hits the correct path
        url: `${protocol}://${fullHost}${proxyPrefix}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

/**
 * Determine the images directory. Prefer resolving from the project root (process.cwd()),
 * falling back to path based on __dirname in case the working directory changes.
 */
const imagesDirCwd = path.resolve(process.cwd(), 'mock_api_backend', 'images');
const imagesDirLocal = path.join(__dirname, '..', 'images');
const resolvedImagesDir = fs.existsSync(imagesDirCwd) ? imagesDirCwd : imagesDirLocal;

/**
 * Determine the videos directory similarly.
 * The repository stores videos under mock_api_backend/videos.
 */
const videosDirCwd = path.resolve(process.cwd(), 'mock_api_backend', 'videos');
const videosDirLocal = path.join(__dirname, '..', 'videos');
const resolvedVideosDir = fs.existsSync(videosDirCwd) ? videosDirCwd : videosDirLocal;

/**
 * PUBLIC_INTERFACE
 * Serve static images from /images mapped to images directory at project root (mock_api_backend/images).
 * This provides stable URLs like /images/<filename>.
 * Ensure static is mounted BEFORE API routes.
 */
app.use(
  '/images',
  express.static(resolvedImagesDir, {
    maxAge: '1d',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    // Set headers for caching and content type safety
    setHeaders: (res, filePath) => {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      // Basic mime hint for common image types; express.static will set proper headers too
      const ext = path.extname(filePath).toLowerCase();
      const m = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      }[ext];
      if (m) res.setHeader('Content-Type', m);
    },
  })
);

/**
 * PUBLIC_INTERFACE
 * Serve static videos from /videos mapped to videos directory at project root (mock_api_backend/videos).
 * This provides URLs like /videos/video.mp4.
 */
app.use(
  '/videos',
  express.static(resolvedVideosDir, {
    maxAge: '1d',
    extensions: ['mp4', 'webm', 'ogg'],
    setHeaders: (res, filePath) => {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      const ext = path.extname(filePath).toLowerCase();
      const m = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.ogg': 'video/ogg',
      }[ext];
      if (m) res.setHeader('Content-Type', m);
    },
  })
);

// Temporary debug endpoint for videos dir
app.get('/__debug/videos-static-check', (req, res) => {
  try {
    const sampleFiles = ['video.mp4'];
    const dirExists =
      fs.existsSync(resolvedVideosDir) && fs.statSync(resolvedVideosDir).isDirectory();
    const listing = dirExists
      ? fs.readdirSync(resolvedVideosDir).filter(f => /\.(mp4|webm|ogg)$/i.test(f)).slice(0, 10)
      : [];
    const checks = {};
    for (const f of sampleFiles) {
      checks[f] = fs.existsSync(path.join(resolvedVideosDir, f));
    }
    res.json({
      resolvedVideosDir,
      basedOn: fs.existsSync(videosDirCwd) ? 'process.cwd()' : '__dirname fallback',
      cwd: process.cwd(),
      __dirname,
      dirExists,
      sampleListing: listing,
      existsChecks: checks,
    });
  } catch (e) {
    res.status(500).json({ error: 'debug-failed', message: e.message });
  }
});

/**
 * PUBLIC_INTERFACE
 * Temporary debug endpoint to verify static image directory resolution.
 * Returns details about the resolved directory, existence of certain files, and a small listing.
 */
app.get('/__debug/static-check', (req, res) => {
  try {
    const sampleFiles = ['you.jpg', 'bcs.jpg', 'the_office.jpg'];
    const dirExists = fs.existsSync(resolvedImagesDir) && fs.statSync(resolvedImagesDir).isDirectory();
    const listing = dirExists ? fs.readdirSync(resolvedImagesDir).filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f)).slice(0, 10) : [];

    const checks = {};
    for (const f of sampleFiles) {
      checks[f] = fs.existsSync(path.join(resolvedImagesDir, f));
    }

    res.json({
      resolvedImagesDir,
      basedOn: fs.existsSync(imagesDirCwd) ? 'process.cwd()' : '__dirname fallback',
      cwd: process.cwd(),
      __dirname,
      dirExists,
      sampleListing: listing,
      existsChecks: checks,
      note: 'This endpoint is temporary for debugging static files and can be removed after verification.',
    });
  } catch (e) {
    res.status(500).json({ error: 'debug-failed', message: e.message });
  }
});

// Mount routes
app.use('/', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

module.exports = app;
