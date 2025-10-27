/**
 * Translation Utilities
 * Runtime translation for dynamic content from database
 */

// Role translations (Italian → English)
export const ROLE_TRANSLATIONS = {
  'Portiere': 'Goalkeeper',
  'Difensore': 'Defender',
  'Centrocampista': 'Midfielder',
  'Attaccante': 'Forward',
};

// Position abbreviations (Italian → English)
export const POSITION_TRANSLATIONS = {
  'POR': 'GK',
  'DC': 'CB',
  'DCS': 'LCB',
  'DCD': 'RCB',
  'TS': 'LB',
  'TD': 'RB',
  'ES': 'LWB',
  'ED': 'RWB',
  'MED': 'DM',
  'CC': 'CM',
  'CS': 'LM',
  'CD': 'RM',
  'TRQ': 'AM',
  'AS': 'LW',
  'AD': 'RW',
  'SP': 'SS',
  'ATT': 'ST',
};

// Position full names (Italian → English)
export const POSITION_FULL_NAMES = {
  'POR': 'Goalkeeper',
  'DC': 'Centre-Back',
  'DCS': 'Left Centre-Back',
  'DCD': 'Right Centre-Back',
  'TS': 'Left-Back',
  'TD': 'Right-Back',
  'ES': 'Left Wing-Back',
  'ED': 'Right Wing-Back',
  'MED': 'Defensive Midfielder',
  'CC': 'Central Midfielder',
  'CS': 'Left Midfielder',
  'CD': 'Right Midfielder',
  'TRQ': 'Attacking Midfielder',
  'AS': 'Left Winger',
  'AD': 'Right Winger',
  'SP': 'Second Striker',
  'ATT': 'Striker',
  'GK': 'Goalkeeper',
  'CB': 'Centre-Back',
  'LCB': 'Left Centre-Back',
  'RCB': 'Right Centre-Back',
  'LB': 'Left-Back',
  'RB': 'Right-Back',
  'LWB': 'Left Wing-Back',
  'RWB': 'Right Wing-Back',
  'DM': 'Defensive Midfielder',
  'CM': 'Central Midfielder',
  'LM': 'Left Midfielder',
  'RM': 'Right Midfielder',
  'AM': 'Attacking Midfielder',
  'LW': 'Left Winger',
  'RW': 'Right Winger',
  'SS': 'Second Striker',
  'ST': 'Striker',
};

// Foot translations
export const FOOT_TRANSLATIONS = {
  'Destro': 'Right',
  'Sinistro': 'Left',
  'Ambidestro': 'Both',
  'destro': 'right',
  'sinistro': 'left',
  'ambidestro': 'both',
};

/**
 * Translate player role
 * @param {string} role - Role in Italian
 * @returns {string} Role in English
 */
export const translateRole = (role) => {
  if (!role) return role;
  return ROLE_TRANSLATIONS[role] || role;
};

/**
 * Translate position abbreviation
 * @param {string} position - Position abbreviation
 * @returns {string} English abbreviation
 */
export const translatePosition = (position) => {
  if (!position) return position;
  return POSITION_TRANSLATIONS[position] || position;
};

/**
 * Translate position to full name
 * @param {string} position - Position abbreviation
 * @returns {string} Full position name in English
 */
export const translatePositionFull = (position) => {
  if (!position) return position;
  return POSITION_FULL_NAMES[position] || position;
};

/**
 * Translate foot preference
 * @param {string} foot - Foot in Italian
 * @returns {string} Foot in English
 */
export const translateFoot = (foot) => {
  if (!foot) return foot;
  return FOOT_TRANSLATIONS[foot] || foot;
};

/**
 * Translate player object (all fields)
 * @param {object} player - Player object
 * @returns {object} Player with translated fields
 */
export const translatePlayer = (player) => {
  if (!player) return player;
  
  return {
    ...player,
    general_role: translateRole(player.general_role),
    specific_position: translatePosition(player.specific_position),
    other_positions: player.other_positions ? translatePosition(player.other_positions) : null,
    preferred_foot: translateFoot(player.preferred_foot),
  };
};

/**
 * Translate array of players
 * @param {array} players - Array of player objects
 * @returns {array} Array with translated players
 */
export const translatePlayers = (players) => {
  if (!Array.isArray(players)) return players;
  return players.map(translatePlayer);
};

export default {
  translateRole,
  translatePosition,
  translatePositionFull,
  translateFoot,
  translatePlayer,
  translatePlayers,
};
