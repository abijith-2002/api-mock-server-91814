'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { buildAbsoluteUrl } = require('../utils/url');

const router = express.Router();

/**
 * Resolve the videos directory robustly:
 * - Prefer process.cwd() based path (repo root when running via npm scripts): <cwd>/mock_api_backend/videos
 * - Fallback to path based on __dirname: <this-file>/../../videos
 */
function resolveVideosDir() {
  const cwdDir = path.resolve(process.cwd(), 'mock_api_backend', 'videos');
  const localDir = path.join(__dirname, '..', '..', 'videos');
  if (fs.existsSync(cwdDir)) return cwdDir;
  return localDir;
}

/**
 * Build the metadata mapping for known episodes.
 * Keys are in the format S{season}E{episode} (e.g., S1E2).
 */
function getEpisodeMetaMap() {
  const map = new Map();
  const entries = [
    { key: 'S1E1', duration: '5m', name: 'Pilot' },
    { key: 'S1E2', duration: '4m', name: 'Prison Mike' },
    { key: 'S1E3', duration: '5m', name: 'Basketball' },
    { key: 'S2E1', duration: '4m', name: 'Sensitivity Training' },
    { key: 'S2E2', duration: '4m', name: 'The Negotiation' },
    { key: 'S3E1', duration: '2m', name: 'Boom! Roasted' },
    { key: 'S3E2', duration: '2m', name: 'The Chump' },
  ];
  for (const e of entries) {
    map.set(e.key, { duration: e.duration, name: e.name });
  }
  return map;
}

/**
 * Scan the videos directory for existing seasons/episodes and return structured data.
 * Only includes episodes where both episode.mp4 and thumbnail.jpg exist.
 * @param {import('express').Request} req
 * @returns {Array<{season:number, episode_count:number, episodes:Array<{src:string, thumbnail:string, duration:string, name:string, episode:number}>}>}
 */
function scanEpisodes(req) {
  const videosRoot = resolveVideosDir();
  if (!fs.existsSync(videosRoot) || !fs.statSync(videosRoot).isDirectory()) {
    return [];
  }

  const seasonDirRegex = /^S(\d+)$/i;
  const episodeDirRegex = /^E(\d+)$/i;
  const meta = getEpisodeMetaMap();

  /** Map seasonNumber -> { season:number, episodes: Array<...> } */
  const seasonsMap = new Map();

  // List season directories
  let seasonEntries = [];
  try {
    seasonEntries = fs.readdirSync(videosRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const dirent of seasonEntries) {
    if (!dirent.isDirectory()) continue;
    const seasonMatch = dirent.name.match(seasonDirRegex);
    if (!seasonMatch) continue;

    const seasonNumber = parseInt(seasonMatch[1], 10);
    const seasonPath = path.join(videosRoot, dirent.name);

    let episodeEntries = [];
    try {
      episodeEntries = fs.readdirSync(seasonPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const eDirent of episodeEntries) {
      if (!eDirent.isDirectory()) continue;
      const episodeMatch = eDirent.name.match(episodeDirRegex);
      if (!episodeMatch) continue;

      const episodeNumber = parseInt(episodeMatch[1], 10);
      const episodePath = path.join(seasonPath, eDirent.name);

      const mp4Path = path.join(episodePath, 'episode.mp4');
      const thumbPath = path.join(episodePath, 'thumbnail.jpg');

      // Validate presence of required files
      if (!(fs.existsSync(mp4Path) && fs.existsSync(thumbPath))) {
        continue;
      }

      const seasonFolder = `S${seasonNumber}`;
      const episodeFolder = `E${episodeNumber}`;

      // Construct absolute URLs using incoming request, under /videos
      const src = buildAbsoluteUrl(req, `/videos/${seasonFolder}/${episodeFolder}/episode.mp4`);
      const thumbnail = buildAbsoluteUrl(req, `/videos/${seasonFolder}/${episodeFolder}/thumbnail.jpg`);

      const key = `S${seasonNumber}E${episodeNumber}`;
      const metaEntry = meta.get(key) || { duration: '', name: key };

      if (!seasonsMap.has(seasonNumber)) {
        seasonsMap.set(seasonNumber, {
          season: seasonNumber,
          episodes: [],
        });
      }
      seasonsMap.get(seasonNumber).episodes.push({
        src,
        thumbnail,
        duration: metaEntry.duration,
        name: metaEntry.name,
        episode: episodeNumber,
      });
    }
  }

  // Build final array: sort seasons asc, and episodes by episode number asc
  const seasons = Array.from(seasonsMap.values())
    .map((s) => {
      const sortedEpisodes = (s.episodes || []).sort((a, b) => a.episode - b.episode);
      return {
        season: s.season,
        episode_count: sortedEpisodes.length,
        episodes: sortedEpisodes.map(({ episode, ...rest }) => rest),
      };
    })
    .sort((a, b) => a.season - b.season);

  return seasons;
}

/**
 * PUBLIC_INTERFACE
 * GET /api/episodes
 * Scans the videos directory for season/episode folders and returns structured JSON:
 * [
 *   {
 *     "season": 1,
 *     "episode_count": 3,
 *     "episodes": [
 *       {
 *         "src": "https://<host>[/proxy/port]/videos/S1/E1/episode.mp4",
 *         "thumbnail": "https://<host>[/proxy/port]/videos/S1/E1/thumbnail.jpg",
 *         "duration": "5m",
 *         "name": "Pilot"
 *       }
 *     ]
 *   }
 * ]
 *
 * - Only includes episodes when both episode.mp4 and thumbnail.jpg exist.
 * - Metadata (duration/name) is provided per mapping for S1E1..S3E2.
 * - If videos directory missing or no episodes, returns 200 with [].
 *
 * @swagger
 * /api/episodes:
 *   get:
 *     summary: List seasons and episodes discovered under /videos
 *     description: |
 *       Scans the server's videos directory for seasons (S{n}) and episodes (E{m}) that contain both episode.mp4 and thumbnail.jpg.
 *       Returns seasons with episode_count and episodes including absolute URLs for src and thumbnail.
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: Array of seasons with episodes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   season:
 *                     type: integer
 *                   episode_count:
 *                     type: integer
 *                   episodes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         src:
 *                           type: string
 *                           description: Absolute URL to the episode video
 *                         thumbnail:
 *                           type: string
 *                           description: Absolute URL to the episode thumbnail
 *                         duration:
 *                           type: string
 *                         name:
 *                           type: string
 *       500:
 *         description: Internal error scanning episodes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: internal-error
 *                 message:
 *                   type: string
 */
router.get('/', (req, res) => {
  try {
    const data = scanEpisodes(req);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'internal-error', message: e.message });
  }
});

module.exports = router;
