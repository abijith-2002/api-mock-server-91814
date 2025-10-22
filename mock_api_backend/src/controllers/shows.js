'use strict';

const showsService = require('../services/shows');

class ShowsController {
  /**
   * PUBLIC_INTERFACE
   * GET /api/:category
   * Returns mock list for the given category with dynamic poster URLs.
   */
  getByCategory(req, res) {
    const { category } = req.params;
    const data = showsService.getCategory(category, req);
    if (!data) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.status(200).json(data);
  }

  /**
   * PUBLIC_INTERFACE
   * GET /api/trending
   */
  trending(req, res) {
    return res.status(200).json(showsService.getCategory('trending', req));
  }

  /**
   * PUBLIC_INTERFACE
   * GET /api/continue_watching
   */
  continueWatching(req, res) {
    return res
      .status(200)
      .json(showsService.getCategory('continue_watching', req));
  }

  /**
   * PUBLIC_INTERFACE
   * GET /api/action
   */
  action(req, res) {
    return res.status(200).json(showsService.getCategory('action', req));
  }

  /**
   * PUBLIC_INTERFACE
   * GET /api/family
   */
  family(req, res) {
    return res.status(200).json(showsService.getCategory('family', req));
  }

  /**
   * PUBLIC_INTERFACE
   * GET /api/comedy
   */
  comedy(req, res) {
    return res.status(200).json(showsService.getCategory('comedy', req));
  }

  /**
   * PUBLIC_INTERFACE
   * GET /api/horror
   */
  horror(req, res) {
    return res.status(200).json(showsService.getCategory('horror', req));
  }

  /**
   * PUBLIC_INTERFACE
   * GET /api/drama
   */
  drama(req, res) {
    return res.status(200).json(showsService.getCategory('drama', req));
  }
}

module.exports = new ShowsController();
