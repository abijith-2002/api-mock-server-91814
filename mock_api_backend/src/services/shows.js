'use strict';

const { buildAbsoluteUrl, ensureHttps } = require('../utils/url');

/**
 * In-place Fisher–Yates shuffle on a shallow copy of the input array.
 * Does NOT mutate the original array reference passed to it.
 * PUBLIC_INTERFACE
 * @param {Array<any>} arr
 * @returns {Array<any>} A new array with shuffled order
 */
function shuffleArray(arr) {
  // Work on a shallow copy to avoid mutating shared in-memory data
  const copy = Array.isArray(arr) ? arr.slice() : [];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // swap copy[i] and copy[j]
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Service that returns mock OTT categories and maps image filenames.
 * Generates dynamic poster URLs based on the incoming request, including proxy prefix if present.
 */
class ShowsService {
  constructor() {
    // Map of category to [ { id, name, file }, ... ]
    // Stable numeric IDs ensure consistency across all endpoints.
    this.data = {
      trending: [
        { id: 1, name: 'Better Call Saul', file: 'bcs.jpg' },
        { id: 2, name: 'Breaking Bad', file: 'br_ba.jpg' },
        { id: 3, name: 'Dexter', file: 'dexter.jpg' },
        { id: 4, name: 'The Witcher', file: 'the_witcher.jpg' },
        { id: 5, name: 'True Detective', file: 'true_detective.jpg' },
        { id: 6, name: 'You', file: 'you.jpg' },
        { id: 7, name: 'The Walking Dead', file: 'the_walking_dead.jpg' },
        { id: 8, name: 'The Last of Us', file: 'the_last_of_us.jpg' },
        { id: 9, name: 'Dark', file: 'dark.jpg' },
        { id: 10, name: 'Stranger Things', file: 'stranger_things.jpg' },
      ],
      continue_watching: [
        { id: 11, name: 'The Boys', file: 'the_boys.jpg' },
        { id: 12, name: 'Money Heist', file: 'money_heist.jpg' },
        { id: 13, name: 'Avatar', file: 'avatar.jpg' },
        { id: 8, name: 'The Last of Us', file: 'the_last_of_us.jpg' }, // reuse stable id for same title
      ],
      action: [
        { id: 4, name: 'The Witcher', file: 'the_witcher.jpg' },
        { id: 11, name: 'The Boys', file: 'the_boys.jpg' },
        { id: 8, name: 'The Last of Us', file: 'the_last_of_us.jpg' },
        { id: 14, name: 'Prison Break', file: 'prison_break.jpg' },
        { id: 15, name: 'Fallout', file: 'fallout.jpg' },
        { id: 13, name: 'Avatar', file: 'avatar.jpg' },
      ],
      family: [
        { id: 13, name: 'Avatar', file: 'avatar.jpg' },
        { id: 16, name: 'Pokemon', file: 'pokemon.jpg' },
        { id: 17, name: 'Bluey', file: 'bluey.jpg' },
        { id: 18, name: 'Phineas and Ferb', file: 'phineas_and_ferb.jpg' },
        { id: 19, name: 'Sonic Prime', file: 'sonic_prime.jpg' },
        { id: 20, name: 'The Big Show Show', file: 'the_big_show.jpg' },
      ],
      comedy: [
        { id: 21, name: 'The Office', file: 'the_office.jpg' },
        { id: 11, name: 'The Boys', file: 'the_boys.jpg' },
        { id: 22, name: 'Friends', file: 'friends.jpg' },
        { id: 23, name: 'Modern Family', file: 'modern_family.jpg' },
        { id: 24, name: 'Seinfeld', file: 'seinfeld.jpg' },
        { id: 25, name: 'Wednesday', file: 'wednesday.jpg' },
      ],
      horror: [
        { id: 10, name: 'Stranger Things', file: 'stranger_things.jpg' },
        { id: 8, name: 'The Last of Us', file: 'the_last_of_us.jpg' },
        { id: 26, name: 'The Sandman', file: 'the_sandman.jpg' },
        { id: 7, name: 'The Walking Dead', file: 'the_walking_dead.jpg' },
        { id: 25, name: 'Wednesday', file: 'wednesday.jpg' },
      ],
      drama: [
        { id: 4, name: 'The Witcher', file: 'the_witcher.jpg' },
        { id: 8, name: 'The Last of Us', file: 'the_last_of_us.jpg' },
        { id: 9, name: 'Dark', file: 'dark.jpg' },
        { id: 10, name: 'Stranger Things', file: 'stranger_things.jpg' },
        { id: 26, name: 'The Sandman', file: 'the_sandman.jpg' },
        { id: 12, name: 'Money Heist', file: 'money_heist.jpg' },
      ],
    };
  }

  /**
   * PUBLIC_INTERFACE
   * Returns the array for a given category with dynamic poster URLs, in randomized order per request.
   * Ensures URLs are always HTTPS even if an upstream proxy/request uses http.
   * @param {string} category
   * @param {import('express').Request} req
   * @returns {Array<{id:number, name: string, poster: string}>}
   */
  getCategory(category, req) {
    const items = this.data[category];
    if (!items) return null;

    // Shuffle a shallow copy so original data is never mutated
    const randomized = shuffleArray(items);

    // Map to response objects with dynamic absolute poster URLs
    return randomized.map(({ id, name, file }) => {
      const abs = buildAbsoluteUrl(req, `/images/${file}`);
      return {
        id,
        name,
        poster: ensureHttps(abs),
      };
    });
  }
}

module.exports = new ShowsService();
