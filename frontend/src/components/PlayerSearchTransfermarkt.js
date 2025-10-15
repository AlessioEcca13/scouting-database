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

  // Database mock di giocatori famosi per demo
  const MOCK_PLAYERS = [
    {
      id: 1,
      name: 'Erling Haaland',
      team: 'Manchester City',
      nationality: '🇳🇴 Norvegia',
      birth_year: 2000,
      height: '194 cm',
      general_role: 'Attaccante',
      specific_position: 'Centre-Forward',
      preferred_foot: 'Sinistro',
      market_value: '€180M',
      transfermarkt_link: 'https://www.transfermarkt.com/erling-haaland/profil/spieler/418560'
    },
    {
      id: 2,
      name: 'Kylian Mbappé',
      team: 'Real Madrid',
      nationality: '🇫🇷 Francia',
      birth_year: 1998,
      height: '178 cm',
      general_role: 'Attaccante',
      specific_position: 'Left Winger',
      preferred_foot: 'Destro',
      market_value: '€180M',
      transfermarkt_link: 'https://www.transfermarkt.com/kylian-mbappe/profil/spieler/342229'
    },
    {
      id: 3,
      name: 'Lionel Messi',
      team: 'Inter Miami',
      nationality: '🇦🇷 Argentina',
      birth_year: 1987,
      height: '170 cm',
      general_role: 'Attaccante',
      specific_position: 'Right Winger',
      preferred_foot: 'Sinistro',
      market_value: '€25M',
      transfermarkt_link: 'https://www.transfermarkt.com/lionel-messi/profil/spieler/28003'
    },
    {
      id: 4,
      name: 'Jude Bellingham',
      team: 'Real Madrid',
      nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inghilterra',
      birth_year: 2003,
      height: '186 cm',
      general_role: 'Centrocampo',
      specific_position: 'Central Midfield',
      preferred_foot: 'Destro',
      market_value: '€180M',
      transfermarkt_link: 'https://www.transfermarkt.com/jude-bellingham/profil/spieler/581678'
    },
    {
      id: 5,
      name: 'Pedri González',
      team: 'FC Barcelona',
      nationality: '🇪🇸 Spagna',
      birth_year: 2002,
      height: '174 cm',
      general_role: 'Centrocampo',
      specific_position: 'Central Midfield',
      preferred_foot: 'Destro',
      market_value: '€100M',
      transfermarkt_link: 'https://www.transfermarkt.com/pedri/profil/spieler/533399'
    },
    {
      id: 6,
      name: 'Vinicius Junior',
      team: 'Real Madrid',
      nationality: '🇧🇷 Brasile',
      birth_year: 2000,
      height: '176 cm',
      general_role: 'Ala',
      specific_position: 'Left Winger',
      preferred_foot: 'Destro',
      market_value: '€150M',
      transfermarkt_link: 'https://www.transfermarkt.com/vinicius-junior/profil/spieler/371998'
    },
    {
      id: 7,
      name: 'Gianluigi Donnarumma',
      team: 'Paris Saint-Germain',
      nationality: '🇮🇹 Italia',
      birth_year: 1999,
      height: '196 cm',
      general_role: 'Portiere',
      specific_position: 'Goalkeeper',
      preferred_foot: 'Destro',
      market_value: '€60M',
      transfermarkt_link: 'https://www.transfermarkt.com/gianluigi-donnarumma/profil/spieler/315858'
    },
    {
      id: 8,
      name: 'Virgil van Dijk',
      team: 'Liverpool FC',
      nationality: '🇳🇱 Olanda',
      birth_year: 1991,
      height: '193 cm',
      general_role: 'Difensore',
      specific_position: 'Centre-Back',
      preferred_foot: 'Destro',
      market_value: '€45M',
      transfermarkt_link: 'https://www.transfermarkt.com/virgil-van-dijk/profil/spieler/139208'
    }
  ];

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

  // Cerca giocatori con debouncing (ricerca locale sui dati mock)
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
    debounceTimer.current = setTimeout(() => {
      setLoading(true);
      setError('');

      try {
        // Simula una ricerca con delay realistico
        setTimeout(() => {
          const filteredPlayers = MOCK_PLAYERS.filter(player =>
            player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.nationality.toLowerCase().includes(searchQuery.toLowerCase())
          );
          
          setSuggestions(filteredPlayers.slice(0, 8));
          setShowDropdown(true);
          setLoading(false);
        }, 300); // Simula delay API
        
      } catch (err) {
        console.error('Errore ricerca:', err);
        setError('Impossibile completare la ricerca');
        setSuggestions([]);
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

  const handleSelectPlayer = (player) => {
    setShowDropdown(false);
    setError('');

    try {
      // Mappa i dati mock al formato del database
      const mappedPlayer = {
        name: player.name,
        birth_year: player.birth_year,
        team: player.team,
        nationality: player.nationality,
        height: player.height,
        general_role: player.general_role,
        specific_position: player.specific_position,
        preferred_foot: player.preferred_foot,
        market_value: player.market_value,
        transfermarkt_link: player.transfermarkt_link,
        notes: `Giocatore importato da database demo.\n\nInformazioni base:\n- Nome: ${player.name}\n- Squadra: ${player.team}\n- Nazionalità: ${player.nationality}\n- Ruolo: ${player.general_role}\n- Posizione: ${player.specific_position}\n- Piede: ${player.preferred_foot}\n- Valore: ${player.market_value}`
      };
      
      // Passa i dati al componente padre
      onSelectPlayer(mappedPlayer);
      
      // Reset ricerca
      setSearchQuery('');
      setSuggestions([]);
      
    } catch (err) {
      console.error('Errore selezione giocatore:', err);
      setError('Impossibile selezionare il giocatore');
    }
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
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                    {player.general_role}
                  </span>
                  <span className="truncate">{player.team}</span>
                  <span className="text-gray-500">{new Date().getFullYear() - player.birth_year} anni</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {player.nationality} • {player.market_value}
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
        <span>Database demo con giocatori famosi - I dati verranno compilati automaticamente nel form</span>
      </div>
      
      {/* Suggerimenti giocatori */}
      {searchQuery.length === 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            <i className="fas fa-star mr-1 text-yellow-500"></i>
            Giocatori disponibili nel database:
          </p>
          <div className="flex flex-wrap gap-1">
            {MOCK_PLAYERS.slice(0, 6).map(player => (
              <button
                key={player.id}
                onClick={() => setSearchQuery(player.name.split(' ')[0])}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                {player.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSearchTransfermarkt;