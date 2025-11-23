'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { buildAbsoluteUrl, ensureHttps } = require('../utils/url');

const router = express.Router();

/**
 * Resolve the images/landscape directory robustly:
 * - Prefer process.cwd() based path (repo root when running via npm scripts)
 * - Fallback to path based on __dirname
 */
function resolveLandscapeDir() {
  const cwdDir = path.resolve(process.cwd(), 'mock_api_backend', 'images', 'landscape');
  const localDir = path.join(__dirname, '..', '..', 'images', 'landscape');
  if (fs.existsSync(cwdDir)) return cwdDir;
  return localDir;
}

/**
 * PUBLIC_INTERFACE
 * GET /api/banner
 * Returns up to 5 random image URLs from images/landscape directory, using the same absolute URL
 * builder as other endpoints to ensure proxy prefix and https normalization.
 *
 * Response shape:
 *  { "banners": ["https://host[/proxy/port]/images/landscape/file1.jpg", ...] }
 *
 * Edge cases:
 *  - If no images found, returns { banners: [] } with 200
 *  - If fewer than 5 images exist, returns available count
 *
 * @swagger
 * /api/banner:
 *   get:
 *     summary: Get 5 random landscape banner image URLs
 *     description: Reads images from images/landscape and returns up to 5 random absolute URLs, normalized to https and respecting proxy prefixes.
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: A JSON object containing an array of banner URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 banners:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - https://example.com/proxy/3001/images/landscape/avatar_landscape.jpg
 *                     - https://example.com/proxy/3001/images/landscape/dark_landscape.jpg
 */
router.get('/', (req, res) => {
  try {
    const dir = resolveLandscapeDir();
    let files = [];
    try {
      // Read directory if exists and is a directory
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        files = fs
          .readdirSync(dir)
          .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f));
      }
    } catch {
      files = [];
    }

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(200).json({ banners: [] });
    }

    // Shuffle with Fisher-Yates (non-mutating)
    const shuffled = files.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, 5);

    // Build absolute URLs consistent with other endpoints using /images static path and buildAbsoluteUrl
    const urls = selected.map((file) => {
      const abs = buildAbsoluteUrl(req, `/images/landscape/${file}`);
      return ensureHttps(abs);
    });

    return res.status(200).json({ banners: urls });
  } catch (e) {
    // On unexpected errors, degrade gracefully with empty array
    return res.status(200).json({ banners: [] });
  }
});

module.exports = router;
