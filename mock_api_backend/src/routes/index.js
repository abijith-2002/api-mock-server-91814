const express = require('express');
const healthController = require('../controllers/health');
const showsController = require('../controllers/shows');
const infoController = require('../controllers/info');
const featuredRoute = require('./featured');
const bannerRoute = require('./banner');
const episodesRoute = require('./episodes');

const router = express.Router();

// Health endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * components:
 *   schemas:
 *     ShowItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Better Call Saul
 *         poster:
 *           type: string
 *           description: Dynamic URL to the poster image (will include proxy prefix in proxied environments, e.g., /proxy/3001)
 *           example: https://example.com/proxy/3001/images/bcs.jpg
 *     ShowInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Better Call Saul
 *         description:
 *           type: string
 *           example: The trials and tribulations of criminal lawyer Jimmy McGill...
 *         seasons:
 *           type: integer
 *           example: 6
 *         total_episodes:
 *           type: integer
 *           example: 63
 */

/**
 * @swagger
 * /api/trending:
 *   get:
 *     summary: Get trending shows
 *     description: Returns a list of trending TV shows with dynamic poster URLs.
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: A JSON array of trending shows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShowItem'
 */
router.get('/api/trending', showsController.trending.bind(showsController));

/**
 * @swagger
 * /api/continue_watching:
 *   get:
 *     summary: Get continue watching list
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: A JSON array of shows you are continuing to watch
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShowItem'
 */
router.get('/api/continue_watching', showsController.continueWatching.bind(showsController));

/**
 * @swagger
 * /api/action:
 *   get:
 *     summary: Get action shows
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: A JSON array of action shows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShowItem'
 */
router.get('/api/action', showsController.action.bind(showsController));

/**
 * @swagger
 * /api/family:
 *   get:
 *     summary: Get family shows
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: A JSON array of family shows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShowItem'
 */
router.get('/api/family', showsController.family.bind(showsController));

/**
 * @swagger
 * /api/comedy:
 *   get:
 *     summary: Get comedy shows
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: A JSON array of comedy shows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShowItem'
 */
router.get('/api/comedy', showsController.comedy.bind(showsController));

/**
 * @swagger
 * /api/horror:
 *   get:
 *     summary: Get horror shows
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: A JSON array of horror shows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShowItem'
 */
router.get('/api/horror', showsController.horror.bind(showsController));

/**
 * @swagger
 * /api/drama:
 *   get:
 *     summary: Get drama shows
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: A JSON array of drama shows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShowItem'
 */
router.get('/api/drama', showsController.drama.bind(showsController));

/**
 * PUBLIC_INTERFACE
 * GET /api/play
 * Returns the absolute URL to the hosted demo video at /videos/video.mp4.
 * The URL is computed from the incoming request without hardcoding hostnames,
 * and will include any proxy prefix if present.
 *
 * @swagger
 * /api/play:
 *   get:
 *     summary: Get absolute URL for the demo video
 *     description: Returns an object containing the absolute URL to /videos/video.mp4 based on the current request host and protocol.
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: Absolute URL for video
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: https://example.com/proxy/3001/videos/video.mp4
 */
router.get('/api/play', (req, res) => {
  try {
    // Compute absolute URL respecting proxy prefix via buildAbsoluteUrl helper
    const { buildAbsoluteUrl } = require('../utils/url');
    const url = buildAbsoluteUrl(req, '/videos/video.mp4');
    return res.status(200).json({ url });
  } catch (e) {
    // Even on error, provide a best-effort URL using protocol/host from Express
    const fallback = `${req.protocol}://${req.get('host')}/videos/video.mp4`;
    return res.status(200).json({ url: fallback });
  }
});

/**
 * Mount featured route
 * Provides GET /api/featured which returns a random featured item.
 */
router.use('/api/featured', featuredRoute);

/**
 * @swagger
 * /api/banner:
 *   get:
 *     summary: Get 5 random landscape banner image URLs
 *     description: Returns up to 5 random image URLs from images/landscape. URLs are absolute, https-normalized, and include proxy prefixes when applicable.
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
 *                     - https://example.com/proxy/3001/images/landscape/stranger_things_landscape.jpg
 */
router.use('/api/banner', bannerRoute);

/**
 * @swagger
 * /api/episodes:
 *   get:
 *     summary: List seasons and episodes discovered under /videos
 *     description: Scans the server's videos directory for seasons (S{n}) and episodes (E{m}) that contain both episode.mp4 and thumbnail.jpg.
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: Array of seasons with episodes
 *       500:
 *         description: Internal error scanning episodes
 */
router.use('/api/episodes', episodesRoute);

/**
 * @swagger
 * /api/info/{id}:
 *   get:
 *     summary: Get show info by id
 *     description: Returns detailed info for a TV show by its stable id. Also supports query parameter ?id= as a fallback.
 *     tags:
 *       - Shows
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The stable id of the show (numeric string accepted).
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional id via query parameter as a fallback.
 *     responses:
 *       200:
 *         description: The show info object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShowInfo'
 *       400:
 *         description: Missing id parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing required id parameter
 *       404:
 *         description: Info not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Info not found
 */
router.get('/api/info/:id?', infoController.get.bind(infoController));

/**
 * @swagger
 * /api/{category}:
 *   get:
 *     summary: Get shows by category
 *     description: Generic endpoint to fetch any supported category by name.
 *     tags:
 *       - Shows
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Category name (e.g. trending, action, family, comedy, horror, drama, continue_watching)
 *     responses:
 *       200:
 *         description: A JSON array of shows in the requested category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShowItem'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Category not found
 */
router.get('/api/:category', showsController.getByCategory.bind(showsController));

module.exports = router;
