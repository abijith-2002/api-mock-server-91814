'use strict';

/**
 * Service that stores and retrieves detailed info for shows using the stable ids
 * present across the application (as defined in shows service data).
 *
 * PUBLIC_INTERFACE
 * getInfoById(id)
 *  - Accepts numeric or string IDs and returns the corresponding info object
 *    with fields: id, title, description, seasons, total_episodes.
 */
class ShowInfoService {
  constructor() {
    /**
     * Internal map of id -> info object.
     * The ids here must match the stable ids used in src/services/shows.js.
     */
    this.infoById = new Map();

    // Seed data: map id to detailed info. Keep fields exactly as required.
    const seed = [
      {
        id: 1,
        title: 'Better Call Saul',
        description:
          'The trials and tribulations of criminal lawyer Jimmy McGill in the time before he established his strip-mall law office in Albuquerque, New Mexico.',
        seasons: 6,
        total_episodes: 63,
      },
      {
        id: 2,
        title: 'Breaking Bad',
        description:
          'A high school chemistry teacher turned methamphetamine producer partners with a former student to secure his family’s future.',
        seasons: 5,
        total_episodes: 62,
      },
      {
        id: 3,
        title: 'Dexter',
        description:
          'A blood splatter expert for the Miami police department leads a secret life as a serial killer of criminals.',
        seasons: 8,
        total_episodes: 96,
      },
      {
        id: 4,
        title: 'The Witcher',
        description:
          'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
        seasons: 3,
        total_episodes: 24,
      },
      {
        id: 5,
        title: 'True Detective',
        description:
          'Anthology series in which police investigations unearth the personal and professional secrets of those involved, both within and outside the law.',
        seasons: 4,
        total_episodes: 32,
      },
      {
        id: 6,
        title: 'You',
        description:
          'A dangerously charming, intensely obsessive young man goes to extreme measures to insert himself into the lives of those he is transfixed by.',
        seasons: 4,
        total_episodes: 40,
      },
      {
        id: 7,
        title: 'The Walking Dead',
        description:
          'Sheriff’s deputy Rick Grimes leads a group of survivors in a world overrun by zombies.',
        seasons: 11,
        total_episodes: 177,
      },
      {
        id: 8,
        title: 'The Last of Us',
        description:
          'Joel and Ellie, a pair connected through the harshness of the world they live in, must survive brutal circumstances and ruthless killers.',
        seasons: 1,
        total_episodes: 9,
      },
      {
        id: 9,
        title: 'Dark',
        description:
          'A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families.',
        seasons: 3,
        total_episodes: 26,
      },
      {
        id: 10,
        title: 'Stranger Things',
        description:
          'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
        seasons: 4,
        total_episodes: 34,
      },
      {
        id: 11,
        title: 'The Boys',
        description:
          'A group of vigilantes known informally as "The Boys" set out to take down corrupt superheroes with no more than blue-collar grit and a willingness to fight dirty.',
        seasons: 4,
        total_episodes: 32,
      },
      {
        id: 12,
        title: 'Money Heist',
        description:
          'A criminal mastermind who goes by "The Professor" has a plan to pull off the biggest heist in recorded history.',
        seasons: 5,
        total_episodes: 41,
      },
      {
        id: 13,
        title: 'Avatar',
        description:
          'A sweeping saga in a lush alien world explores the bonds between nature, people, and survival.',
        seasons: 1,
        total_episodes: 8,
      },
      {
        id: 14,
        title: 'Prison Break',
        description:
          'When his brother is wrongfully sentenced to death, a structural engineer devises an elaborate plan to help him escape from prison.',
        seasons: 5,
        total_episodes: 90,
      },
      {
        id: 15,
        title: 'Fallout',
        description:
          'In a post-apocalyptic retro-futuristic world, survivors navigate factions, vaults, and wastelands.',
        seasons: 1,
        total_episodes: 8,
      },
      {
        id: 16,
        title: 'Pokemon',
        description:
          'Ash Ketchum and his partner Pikachu travel the world of Pokémon, meeting friends and battling Trainers.',
        seasons: 25,
        total_episodes: 1200,
      },
      {
        id: 17,
        title: 'Bluey',
        description:
          'Bluey, a Blue Heeler puppy, has a wonderful habit of turning everyday life into extraordinary adventures.',
        seasons: 3,
        total_episodes: 151,
      },
      {
        id: 18,
        title: 'Phineas and Ferb',
        description:
          'Stepbrothers Phineas and Ferb make the most of their summer vacation with wild inventions and adventures.',
        seasons: 4,
        total_episodes: 129,
      },
      {
        id: 19,
        title: 'Sonic Prime',
        description:
          'Sonic’s world shatters and he races through new realities to save his friends and fix the multiverse.',
        seasons: 3,
        total_episodes: 24,
      },
      {
        id: 20,
        title: 'The Big Show Show',
        description:
          'Former WWE wrestler The Big Show raises his three daughters with his wife in Florida.',
        seasons: 1,
        total_episodes: 8,
      },
      {
        id: 21,
        title: 'The Office',
        description:
          'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
        seasons: 9,
        total_episodes: 201,
      },
      {
        id: 22,
        title: 'Friends',
        description:
          'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.',
        seasons: 10,
        total_episodes: 236,
      },
      {
        id: 23,
        title: 'Modern Family',
        description:
          'Three diverse but related families face trials and tribulations in their own uniquely comedic ways.',
        seasons: 11,
        total_episodes: 250,
      },
      {
        id: 24,
        title: 'Seinfeld',
        description:
          'Stand-up comedian Jerry Seinfeld deals with the absurdities of everyday life along with his eccentric friends in New York City.',
        seasons: 9,
        total_episodes: 180,
      },
      {
        id: 25,
        title: 'Wednesday',
        description:
          'Wednesday Addams, a high school student, attempts to master her psychic ability and stop a killing spree at her school.',
        seasons: 1,
        total_episodes: 8,
      },
      {
        id: 26,
        title: 'The Sandman',
        description:
          'Upon escaping after decades of imprisonment by a mortal wizard, Dream, the personification of dreams, sets about to reclaim his lost equipment.',
        seasons: 1,
        total_episodes: 11,
      },
    ];

    for (const item of seed) {
      this.infoById.set(String(item.id), { ...item });
    }
  }

  // PUBLIC_INTERFACE
  getInfoById(id) {
    /** This is a public function. Returns show info by id or null if not found. */
    if (id === undefined || id === null) return null;
    const key = String(id).trim();
    if (key.length === 0) return null;
    return this.infoById.get(key) || null;
  }
}

module.exports = new ShowInfoService();
