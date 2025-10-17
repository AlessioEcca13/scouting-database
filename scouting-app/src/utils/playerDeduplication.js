/**
 * Sistema di Deduplica Giocatori
 * 
 * Crea ID univoci basati su:
 * - Nome completo (normalizzato)
 * - Nazionalità
 * - Data di nascita (anno)
 */

/**
 * Normalizza una stringa per il confronto
 * - Rimuove accenti
 * - Lowercase
 * - Rimuove spazi extra
 * - Rimuove caratteri speciali
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
 * Genera ID univoco per un giocatore
 * Format: nome_nazionalita_anno
 * 
 * @param {Object} player - Oggetto giocatore
 * @returns {string} - ID univoco
 */
export const generatePlayerUniqueId = (player) => {
  const name = normalizeString(player.name || '');
  const nationality = normalizeString(player.nationality || player.nation || '');
  const birthYear = player.birth_year || player.birthYear || '';
  
  if (!name) {
    throw new Error('Nome giocatore obbligatorio per generare ID univoco');
  }
  
  return `${name}_${nationality}_${birthYear}`.toLowerCase();
};

/**
 * Estrae ID giocatore da URL Transfermarkt
 * 
 * @param {string} url - URL Transfermarkt
 * @returns {string|null} - ID Transfermarkt o null
 */
export const extractTransfermarktId = (url) => {
  if (!url) return null;
  
  // Pattern: https://www.transfermarkt.com/player-name/profil/spieler/123456
  const match = url.match(/spieler\/(\d+)/);
  return match ? match[1] : null;
};

/**
 * Verifica se due giocatori sono duplicati
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
 * Trova giocatori duplicati in un array
 * 
 * @param {Object} newPlayer - Nuovo giocatore da verificare
 * @param {Array} existingPlayers - Array di giocatori esistenti
 * @returns {Array} - Array di giocatori duplicati trovati
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
    console.error('Errore ricerca duplicati:', error);
    return [];
  }
};

/**
 * Verifica se un link Transfermarkt è già stato usato
 * 
 * @param {string} url - URL Transfermarkt
 * @param {Array} existingPlayers - Array di giocatori esistenti
 * @returns {Object|null} - Giocatore esistente o null
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
 * Crea messaggio di errore per duplicato
 * 
 * @param {Object} existingPlayer - Giocatore esistente
 * @returns {string} - Messaggio di errore
 */
export const createDuplicateMessage = (existingPlayer) => {
  const name = existingPlayer.name || 'Sconosciuto';
  const team = existingPlayer.team || 'N/D';
  const age = existingPlayer.birth_year 
    ? `${new Date().getFullYear() - existingPlayer.birth_year} anni` 
    : 'N/D';
  
  return `Giocatore già presente: ${name} (${team}, ${age})`;
};
