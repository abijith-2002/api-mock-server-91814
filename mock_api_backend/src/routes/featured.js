'use strict';

const express = require('express');
const router = express.Router();

/**
 * Hardcoded featured items list as requested.
 * Minimal validation will ensure the array is non-empty before selecting a random item.
 */
const FEATURED_ITEMS = [
  { name: 'MONSTER: The Ed Gein Story', poster: 'url/images/monster_featured.jpg' },
  { name: 'Peacemaker', poster: 'url/images/peacemaker_featured.jpg' },
];

/**
 * PUBLIC_INTERFACE
 * GET /api/featured
 * Returns a random featured item wrapped in { data: { name, poster } }
 */

/**
 * @swagger
 * /api/featured:
 *   get:
 *     summary: Get a random featured item
 *     description: Returns one random object from the featured list.
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
 *                     name:
 *                       type: string
 *                       example: MONSTER: The Ed Gein Story
 *                     poster:
 *                       type: string
 *                       example: url/images/monster_featured.jpg
 *       500:
 *         description: No featured items available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No featured items available
 */
router.get('/', (req, res) => {
  try {
    if (!Array.isArray(FEATURED_ITEMS) || FEATURED_ITEMS.length === 0) {
      return res.status(500).json({ error: 'No featured items available' });
    }
    const idx = Math.floor(Math.random() * FEATURED_ITEMS.length);
    const selected = FEATURED_ITEMS[idx];
    return res.status(200).json({ data: selected });
  } catch (err) {
    // Fallback error safety
    return res.status(500).json({ error: 'No featured items available' });
  }
});

module.exports = router;
