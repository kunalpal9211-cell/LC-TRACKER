import ratingsData from '../data/ratings.json';

/**
 * Returns the ZeroTrac contest rating for a given problem number or slug
 * @param {number|string} num Problem number
 * @param {string} slug Problem slug
 * @param {string} difficulty Default difficulty ('Easy' | 'Medium' | 'Hard')
 * @returns {number}
 */
export function getProblemRating(num, slug, difficulty) {
  if (ratingsData[num]) return ratingsData[num];
  if (slug && ratingsData[slug]) return ratingsData[slug];
  
  if (difficulty === 'Hard') return 1950;
  if (difficulty === 'Medium') return 1550;
  return 1150;
}

/**
 * Returns a human-friendly tier label for a rating
 * @param {number} rating
 * @returns {string}
 */
export function getRatingTier(rating) {
  if (!rating) return 'Unrated';
  if (rating < 1200) return 'Novice';
  if (rating < 1600) return 'Specialist';
  if (rating < 2000) return 'Expert';
  return 'Master';
}
