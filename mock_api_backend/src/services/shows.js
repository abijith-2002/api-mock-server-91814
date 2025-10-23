'use strict';

const { buildAbsoluteUrl, ensureHttps } = require('../utils/url');

/**
 * Service that returns mock OTT categories and maps image filenames.
 * Generates dynamic poster URLs based on the incoming request, including proxy prefix if present.
 */
class ShowsService {
  constructor() {
    // Map of category to [ { name, file }, ... ]
    this.data = {
      trending: [
        { name: 'Better Call Saul', file: 'bcs.jpg' },
        { name: 'Breaking Bad', file: 'br_ba.jpg' },
        { name: 'Dexter', file: 'dexter.jpg' },
        { name: 'The Witcher', file: 'the_witcher.jpg' },
        { name: 'True Detective', file: 'true_detective.jpg' },
        { name: 'You', file: 'you.jpg' },
        { name: 'The Walking Dead', file: 'the_walking_dead.jpg' },
        { name: 'The Last of Us', file: 'the_last_of_us.jpg' },
        { name: 'Dark', file: 'dark.jpg' },
        { name: 'Stranger Things', file: 'stranger_things.jpg' },
      ],
      continue_watching: [
        { name: 'The Boys', file: 'the_boys.jpg' },
        { name: 'Money Heist', file: 'money_heist.jpg' },
        { name: 'Avatar', file: 'avatar.jpg' },
        { name: 'The Last of Us', file: 'the_last_of_us.jpg' },
      ],
      action: [
        { name: 'The Witcher', file: 'the_witcher.jpg' },
        { name: 'The Boys', file: 'the_boys.jpg' },
        { name: 'The Last of Us', file: 'the_last_of_us.jpg' },
        { name: 'Prison Break', file: 'prison_break.jpg' },
        { name: 'Fallout', file: 'fallout.jpg' },
        { name: 'Avatar', file: 'avatar.jpg' },
      ],
      family: [
        { name: 'Avatar', file: 'avatar.jpg' },
        { name: 'Pokemon', file: 'pokemon.jpg' },
        { name: 'Bluey', file: 'bluey.jpg' },
        { name: 'Phineas and Ferb', file: 'phineas_and_ferb.jpg' },
        { name: 'Sonic Prime', file: 'sonic_prime.jpg' },
        { name: 'The Big Show Show', file: 'the_big_show.jpg' },
      ],
      comedy: [
        { name: 'The Office', file: 'the_office.jpg' },
        { name: 'The Boys', file: 'the_boys.jpg' },
        { name: 'Friends', file: 'friends.jpg' },
        { name: 'Modern Family', file: 'modern_family.jpg' },
        { name: 'Seinfeld', file: 'seinfeld.jpg' },
        { name: 'Wednesday', file: 'wednesday.jpg' },
      ],
      horror: [
        { name: 'Stranger Things', file: 'stranger_things.jpg' },
        { name: 'The Last of Us', file: 'the_last_of_us.jpg' },
        { name: 'The Sandman', file: 'the_sandman.jpg' },
        { name: 'The Walking Dead', file: 'the_walking_dead.jpg' },
        { name: 'Wednesday', file: 'wednesday.jpg' },
      ],
      drama: [
        { name: 'The Witcher', file: 'the_witcher.jpg' },
        { name: 'The Last of Us', file: 'the_last_of_us.jpg' },
        { name: 'Dark', file: 'dark.jpg' },
        { name: 'Stranger Things', file: 'stranger_things.jpg' },
        { name: 'The Sandman', file: 'the_sandman.jpg' },
        { name: 'Money Heist', file: 'money_heist.jpg' },
      ],
    };
  }

  /**
   * PUBLIC_INTERFACE
   * Returns the array for a given category with dynamic poster URLs.
   * Ensures URLs are always HTTPS even if an upstream proxy/request uses http.
   * @param {string} category
   * @param {import('express').Request} req
   * @returns {Array<{name: string, poster: string}>}
   */
  getCategory(category, req) {
    const items = this.data[category];
    if (!items) return null;
    return items.map(({ name, file }) => {
      const abs = buildAbsoluteUrl(req, `/images/${file}`);
      return {
        name,
        poster: ensureHttps(abs),
      };
    });
  }
}

module.exports = new ShowsService();
