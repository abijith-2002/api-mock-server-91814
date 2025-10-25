'use strict';

const showInfoService = require('../services/showInfo');

class InfoController {
  /**
   * PUBLIC_INTERFACE
   * GET /api/info/:id and GET /api/info?id=
   * Returns the show's info object by the given id.
   * - Validates presence of id and returns 400 if missing
   * - Returns 404 if not found
   * - Response shape: { id, title, description, seasons, total_episodes }
   */
  get(req, res) {
    // Prefer path param, fallback to query param
    const idParam = req.params.id ?? req.query.id;
    if (idParam === undefined || idParam === null || String(idParam).trim() === '') {
      return res.status(400).json({ error: 'Missing required id parameter' });
    }

    // Accept numeric or string ids; coerce to string internally
    const info = showInfoService.getInfoById(idParam);
    if (!info) {
      return res.status(404).json({ error: 'Info not found' });
    }

    // Return the exact info format including id
    return res.status(200).json({
      id: info.id,
      title: info.title,
      description: info.description,
      seasons: info.seasons,
      total_episodes: info.total_episodes,
    });
  }
}

module.exports = new InfoController();
