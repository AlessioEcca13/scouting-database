// src/components/PlayerSearchTransfermarkt.js
import React, { useState, useEffect, useRef } from 'react';

const PlayerSearchTransfermarkt = ({ onSelectPlayer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  const API_BASE = 'https://transfermarkt-api.fly.dev';

  // Chiudi dropdown quando clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerca giocatori con debouncing
  useEffect(() => {
    // Pulisci il timer precedente
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Se la query è troppo corta, resetta tutto
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Imposta nuovo timer di debounce
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${API_BASE}/players/search?query=${encodeURIComponent(searchQuery)}`
        );
        
        if (!response.ok) {
          throw new Error('Errore nella ricerca');
        }
        
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data.slice(0, 10) : []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Errore ricerca:', err);
        setError('Impossibile completare la ricerca');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500); // Aspetta 500ms dopo che l'utente smette di digitare

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleSelectPlayer = async (player) => {
    setLoading(true);
    setShowDropdown(false);
    setError('');

    try {
      // Ottieni dettagli completi del giocatore
      const response = await fetch(`${API_BASE}/players/${player.id}`);
      if (!response.ok) throw new Error('Errore nel caricamento dettagli');
      
      const detailedData = await response.json();
      
      // Mappa i dati di Transfermarkt al formato del tuo database
      const mappedPlayer = mapTransfermarktToDatabase(detailedData);
      
      // Passa i dati al componente padre
      onSelectPlayer(mappedPlayer);
      
      // Reset ricerca
      setSearchQuery('');
      setSuggestions([]);
      
    } catch (err) {
      console.error('Errore caricamento dettagli:', err);
      setError('Impossibile caricare i dettagli del giocatore');
    } finally {
      setLoading(false);
    }
  };

  // Funzione per mappare i dati di Transfermarkt al tuo schema database
  const mapTransfermarktToDatabase = (tmData) => {
    // Estrai l'anno di nascita dalla data
    let birthYear = null;
    if (tmData.dateOfBirth) {
      const match = tmData.dateOfBirth.match(/\d{4}/);
      birthYear = match ? parseInt(match[0]) : null;
    }

    // Mappa la posizione al tuo sistema di ruoli
    const roleMapping = {
      'Goalkeeper': 'Portiere',
      'Centre-Back': 'Difensore',
      'Left-Back': 'Terzino',
      'Right-Back': 'Terzino',
      'Defensive Midfield': 'Centrocampo',
      'Central Midfield': 'Centrocampo',
      'Attacking Midfield': 'Centrocampo',
      'Left Winger': 'Ala',
      'Right Winger': 'Ala',
      'Left Midfield': 'Ala',
      'Right Midfield': 'Ala',
      'Second Striker': 'Attaccante',
      'Centre-Forward': 'Attaccante'
    };

    // Mappa il piede
    const footMapping = {
      'right': 'Destro',
      'left': 'Sinistro',
      'both': 'Ambidestro'
    };

    return {
      name: tmData.name || '',
      birth_year: birthYear,
      team: tmData.currentClub || tmData.club || '',
      nationality: tmData.nationality || tmData.citizenship || '',
      height: tmData.height || '',
      general_role: roleMapping[tmData.position] || 'Centrocampo',
      specific_position: tmData.position || '',
      preferred_foot: footMapping[tmData.foot?.toLowerCase()] || 'Destro',
      market_value: tmData.marketValue || '',
      transfermarkt_link: tmData.playerURL || '',
      // Aggiungi note automatiche
      notes: `Importato da Transfermarkt\nClub: ${tmData.currentClub || 'N/A'}\nData di nascita: ${tmData.dateOfBirth || 'N/A'}\nValore di mercato: ${tmData.marketValue || 'N/A'}`,
      // Valori predefiniti
      current_value: 3,
      potential_value: 3,
      priority: 'Media',
      director_feedback: 'Da valutare',
      check_type: 'Dati'
    };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Box */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-search"></i>
          )}
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Cerca su Transfermarkt (es: Messi, Haaland...)"
          className="w-full pl-10 pr-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-blue-50"
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />
        
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Dropdown Suggerimenti */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          <div className="p-2 bg-blue-50 border-b border-blue-200">
            <p className="text-xs text-blue-700 font-medium">
              <i className="fas fa-info-circle mr-1"></i>
              Trovati {suggestions.length} giocatori - Clicca per importare i dati
            </p>
          </div>
          
          {suggestions.map((player, index) => (
            <div
              key={player.id || index}
              onClick={() => handleSelectPlayer(player)}
              className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-white text-lg"></i>
              </div>
              
              {/* Info Giocatore */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate">
                  {player.name}
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-2 flex-wrap mt-1">
                  {player.position && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {player.position}
                    </span>
                  )}
                  {player.club && (
                    <span className="truncate">{player.club}</span>
                  )}
                  {player.age && (
                    <span className="text-gray-500">{player.age} anni</span>
                  )}
                </div>
              </div>

              {/* Freccia */}
              <div className="flex-shrink-0 text-blue-500">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messaggio nessun risultato */}
      {showDropdown && !loading && suggestions.length === 0 && searchQuery.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-6 text-center">
          <i className="fas fa-search text-4xl text-gray-300 mb-2"></i>
          <p className="text-gray-600 font-medium">Nessun giocatore trovato</p>
          <p className="text-sm text-gray-500 mt-1">
            Prova con un altro nome o cognome
          </p>
        </div>
      )}

      {/* Errore */}
      {error && (
        <div className="absolute z-50 w-full mt-2 bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </p>
        </div>
      )}

      {/* Info Helper */}
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
        <i className="fas fa-lightbulb text-yellow-500"></i>
        <span>I dati verranno importati automaticamente da Transfermarkt e compilati nel form</span>
      </div>
    </div>
  );
};

export default PlayerSearchTransfermarkt;