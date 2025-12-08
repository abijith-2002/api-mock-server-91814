'use strict';

const express = require('express');
const router = express.Router();

/**
 * Hardcoded featured items list as requested.
 * Minimal validation will ensure the array is non-empty before selecting a random item.
 * Ensure each item has a stable id.
 */
const FEATURED_ITEMS = [
  { id: 1001, name: 'MONSTER: The Ed Gein Story', poster: 'url/images/monster_featured.jpg' },
  { id: 1002, name: 'Peacemaker', poster: 'url/images/peacemaker_featured.jpg' },
];

/**
 * PUBLIC_INTERFACE
 * GET /api/featured
 * Returns a random featured item wrapped in { data: { id, name, poster } }
 */

/**
 * @swagger
 * /api/featured:
 *   get:
 *     summary: Get a random featured item
 *     description: Returns one random object from the featured list. Poster URL is normalized to the current request's base URL.
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: A random featured item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1001
 *                     name:
 *                       type: string
 *                       example: "MONSTER: The Ed Gein Story"
 *                     poster:
 *                       type: string
 *                       example: "http://localhost:3001/images/monster_featured.jpg"
 *       500:
 *         description: No featured items available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No featured items available"
 */
router.get('/', (req, res) => {
  try {
    if (!Array.isArray(FEATURED_ITEMS) || FEATURED_ITEMS.length === 0) {
      return res.status(500).json({ error: 'No featured items available' });
    }

    // Compute request base URL: protocol + host (including port if provided by proxy/host header)
    const protocol = req.protocol; // trust proxy is enabled at app level
    const host = req.get('host'); // may include port
    const base = `${protocol}://${host}`;

    // Select a random featured item
    const idx = Math.floor(Math.random() * FEATURED_ITEMS.length);
    const selected = FEATURED_ITEMS[idx];

    // Normalize poster URL:
    // - If it starts with 'url/', replace with '<protocol>://<host>/'
    // - If it starts with '/images' or 'images', prefix with base accordingly
    let poster = selected.poster || '';

    if (poster.startsWith('url/')) {
      poster = poster.replace(/^url\//, `${base}/`);
    } else if (poster.startsWith('/images/')) {
      poster = `${base}${poster}`;
    } else if (poster.startsWith('images/')) {
      poster = `${base}/${poster}`;
    }

    return res.status(200).json({ data: { id: selected.id, name: selected.name, poster } });
  } catch (err) {
    // Fallback error safety
    return res.status(500).json({ error: 'No featured items available' });
  }
});

module.exports = router;
