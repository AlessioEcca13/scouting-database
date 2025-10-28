/**
 * Player Deduplication System
 * 
 * Creates unique IDs based on:
 * - Full name (normalized)
 * - Nationality
 * - Birth date (year)
 */

/**
 * Normalize a string for comparison
 * - Remove accents
 * - Lowercase
 * - Remove extra spaces
 * - Remove special characters
 */
export const normalizeString = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .normalize('NFD') // Decompose accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Keep only alphanumeric and spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

/**
 * Generate unique ID for a player
 * Format: name_nationality_year
 * 
 * @param {Object} player - Player object
 * @returns {string} - Unique ID
 */
export const generatePlayerUniqueId = (player) => {
  const name = normalizeString(player.name || '');
  const nationality = normalizeString(player.nationality || player.nation || '');
  const birthYear = player.birth_year || player.birthYear || '';
  
  if (!name) {
    throw new Error('Player name required to generate unique ID');
  }
  
  return `${name}_${nationality}_${birthYear}`.toLowerCase();
};

/**
 * Extract player ID from Transfermarkt URL
 * 
 * @param {string} url - Transfermarkt URL
 * @returns {string|null} - Transfermarkt ID or null
 */
export const extractTransfermarktId = (url) => {
  if (!url) return null;
  
  // Pattern: https://www.transfermarkt.com/player-name/profil/spieler/123456
  const match = url.match(/spieler\/(\d+)/);
  return match ? match[1] : null;
};

/**
 * Check if two players are duplicates
 * 
 * @param {Object} player1 
 * @param {Object} player2 
 * @returns {boolean}
 */
export const areDuplicatePlayers = (player1, player2) => {
  try {
    const id1 = generatePlayerUniqueId(player1);
    const id2 = generatePlayerUniqueId(player2);
    return id1 === id2;
  } catch (error) {
    return false;
  }
};

/**
 * Find duplicate players in an array
 * 
 * @param {Object} newPlayer - New player to check
 * @param {Array} existingPlayers - Array of existing players
 * @returns {Array} - Array of duplicate players found
 */
export const findDuplicatePlayers = (newPlayer, existingPlayers) => {
  if (!newPlayer || !Array.isArray(existingPlayers)) {
    return [];
  }
  
  try {
    const newPlayerId = generatePlayerUniqueId(newPlayer);
    
    return existingPlayers.filter(existing => {
      try {
        const existingId = generatePlayerUniqueId(existing);
        return existingId === newPlayerId;
      } catch (error) {
        return false;
      }
    });
  } catch (error) {
    console.error('Error searching duplicates:', error);
    return [];
  }
};

/**
 * Check if a Transfermarkt link has already been used
 * 
 * @param {string} url - Transfermarkt URL
 * @param {Array} existingPlayers - Array of existing players
 * @returns {Object|null} - Existing player or null
 */
export const findPlayerByTransfermarktUrl = (url, existingPlayers) => {
  const tmId = extractTransfermarktId(url);
  if (!tmId || !Array.isArray(existingPlayers)) {
    return null;
  }
  
  return existingPlayers.find(player => {
    const playerTmId = extractTransfermarktId(player.transfermarkt_url);
    return playerTmId === tmId;
  });
};

/**
 * Create error message for duplicate
 * 
 * @param {Object} existingPlayer - Existing player
 * @returns {string} - Error message
 */
export const createDuplicateMessage = (existingPlayer) => {
  const name = existingPlayer.name || 'Unknown';
  const team = existingPlayer.team || 'N/A';
  const age = existingPlayer.birth_year 
    ? `${new Date().getFullYear() - existingPlayer.birth_year} years` 
    : 'N/A';
  
  return `Player already exists: ${name} (${team}, ${age})`;
};
