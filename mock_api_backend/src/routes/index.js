const express = require('express');
const healthController = require('../controllers/health');
const showsController = require('../controllers/shows');

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
 *         name:
 *           type: string
 *           example: Better Call Saul
 *         poster:
 *           type: string
 *           description: Dynamic URL to the poster image
 *           example: https://example.com/media/bcs.jpg
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
