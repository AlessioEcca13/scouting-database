// src/components/FormationField.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function FormationField({ list, onClose }) {
  const [players, setPlayers] = useState([]);
  const [formation, setFormation] = useState('4-3-3');
  const [fieldColor, setFieldColor] = useState('green');
  const [zoom, setZoom] = useState(100);
  const [showOptions, setShowOptions] = useState({
    photo: true,
    age: false,
    club: false,
    shirtNumber: false,
    marketValue: false,
    height: false
  });
  const [playerColors, setPlayerColors] = useState({});
  const [selectedPlayerForColor, setSelectedPlayerForColor] = useState(null);
  const [positionAssignments, setPositionAssignments] = useState({});
  const [draggedPlayer, setDraggedPlayer] = useState(null);

  const formations = {
    '4-4-2': [
      { role: 'GK', positions: [[50, 90]] },
      { role: 'DF', positions: [[20, 70], [40, 70], [60, 70], [80, 70]] },
      { role: 'MF', positions: [[20, 45], [40, 45], [60, 45], [80, 45]] },
      { role: 'FW', positions: [[35, 20], [65, 20]] }
    ],
    '4-3-3': [
      { role: 'GK', positions: [[50, 90]] },
      { role: 'DF', positions: [[20, 70], [40, 70], [60, 70], [80, 70]] },
      { role: 'MF', positions: [[30, 45], [50, 45], [70, 45]] },
      { role: 'FW', positions: [[20, 20], [50, 15], [80, 20]] }
    ],
    '3-5-2': [
      { role: 'GK', positions: [[50, 90]] },
      { role: 'DF', positions: [[30, 70], [50, 70], [70, 70]] },
      { role: 'MF', positions: [[15, 50], [35, 45], [50, 40], [65, 45], [85, 50]] },
      { role: 'FW', positions: [[35, 20], [65, 20]] }
    ],
    '3-4-3': [
      { role: 'GK', positions: [[50, 90]] },
      { role: 'DF', positions: [[30, 70], [50, 70], [70, 70]] },
      { role: 'MF', positions: [[25, 50], [45, 45], [55, 45], [75, 50]] },
      { role: 'FW', positions: [[20, 20], [50, 15], [80, 20]] }
    ],
    '4-2-3-1': [
      { role: 'GK', positions: [[50, 90]] },
      { role: 'DF', positions: [[20, 70], [40, 70], [60, 70], [80, 70]] },
      { role: 'MF', positions: [[35, 55], [65, 55], [25, 35], [50, 30], [75, 35]] },
      { role: 'FW', positions: [[50, 15]] }
    ],
    '4-1-4-1': [
      { role: 'GK', positions: [[50, 90]] },
      { role: 'DF', positions: [[20, 70], [40, 70], [60, 70], [80, 70]] },
      { role: 'MF', positions: [[50, 55], [20, 40], [40, 35], [60, 35], [80, 40]] },
      { role: 'FW', positions: [[50, 15]] }
    ]
  };

  useEffect(() => {
    if (list?.player_ids) {
      fetchPlayers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .in('id', list.player_ids);

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Errore caricamento giocatori:', error);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getRoleCategory = (role) => {
    if (!role) return 'MF';
    const r = role.toUpperCase();
    if (r.includes('PORT') || r === 'GK') return 'GK';
    if (r.includes('DIF') || r.includes('TERZINO') || r.includes('CENTRALE') || r === 'DF') return 'DF';
    if (r.includes('ATT') || r.includes('PUNTA') || r === 'FW' || r === 'ST') return 'FW';
    return 'MF';
  };

  // Removed unused function getPlayersByRole

  const assignPlayersToPositions = () => {
    const formationData = formations[formation];
    const assigned = [];
    let posIndex = 0;

    formationData.forEach(line => {
      line.positions.forEach((pos) => {
        const posKey = `pos_${posIndex}`;
        if (positionAssignments[posKey]) {
          const player = players.find(p => p.id === positionAssignments[posKey]);
          if (player) {
            assigned.push({
              player,
              x: pos[0],
              y: pos[1],
              posKey
            });
          }
        }
        posIndex++;
      });
    });

    return assigned;
  };

  const getAllPositions = () => {
    const formationData = formations[formation];
    const positions = [];
    let posIndex = 0;

    formationData.forEach(line => {
      line.positions.forEach((pos) => {
        positions.push({
          x: pos[0],
          y: pos[1],
          posKey: `pos_${posIndex}`,
          role: line.role
        });
        posIndex++;
      });
    });

    return positions;
  };

  const assignPlayerToPosition = (playerId, posKey) => {
    setPositionAssignments(prev => ({
      ...prev,
      [posKey]: playerId
    }));
  };

  const removePlayerFromPosition = (posKey) => {
    setPositionAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[posKey];
      return newAssignments;
    });
  };

  const getUnassignedPlayers = () => {
    const assignedIds = Object.values(positionAssignments);
    return players.filter(p => !assignedIds.includes(p.id));
  };

  const colorPresets = [
    { name: 'Scadenza 2025', color: '#FEF3C7', textColor: '#92400E' },
    { name: 'Under', color: '#DBEAFE', textColor: '#1E40AF' },
    { name: 'Priorità Alta', color: '#FEE2E2', textColor: '#991B1B' },
    { name: 'In Prestito', color: '#E9D5FF', textColor: '#6B21A8' },
    { name: 'Svincolato', color: '#D1FAE5', textColor: '#065F46' },
    { name: 'Titolare', color: '#FED7AA', textColor: '#9A3412' },
    { name: 'Riserva', color: '#E5E7EB', textColor: '#374151' },
    { name: 'Personalizzato', color: '#FFFFFF', textColor: '#000000' }
  ];

  const assignedPlayers = assignPlayersToPositions();
  const allPositions = getAllPositions();
  const unassignedPlayers = getUnassignedPlayers();
  const currentYear = new Date().getFullYear();

  const fieldColors = {
    green: 'bg-gradient-to-b from-green-500 to-green-600',
    darkGreen: 'bg-gradient-to-b from-green-700 to-green-800',
    blue: 'bg-gradient-to-b from-blue-500 to-blue-600'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 px-6 py-4 rounded-t-xl flex justify-between items-center border-b-2 border-yellow-500">
          <div>
            <h2 className="text-2xl font-bold text-white">{list.name}</h2>
            <p className="text-sm text-gray-300">{players.length} giocatori</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Formazione */}
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-yellow-500"
            >
              <option value="4-4-2">4-4-2</option>
              <option value="4-3-3">4-3-3</option>
              <option value="3-5-2">3-5-2</option>
              <option value="3-4-3">3-4-3</option>
              <option value="4-2-3-1">4-2-3-1</option>
              <option value="4-1-4-1">4-1-4-1</option>
            </select>

            {/* Colore Campo */}
            <select
              value={fieldColor}
              onChange={(e) => setFieldColor(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-yellow-500"
            >
              <option value="green">Verde Chiaro</option>
              <option value="darkGreen">Verde Scuro</option>
              <option value="blue">Blu</option>
            </select>

            {/* Zoom */}
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm">Zoom:</span>
              <input
                type="range"
                min="80"
                max="120"
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className="w-24"
              />
              <span className="text-sm w-12">{zoom}%</span>
            </div>

            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Opzioni Display */}
        <div className="bg-gray-800 px-6 py-3 flex gap-4 text-sm">
          {Object.entries({
            photo: 'Foto',
            age: 'Età',
            club: 'Squadra',
            shirtNumber: 'Numero',
            marketValue: 'Valore',
            height: 'Altezza'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={showOptions[key]}
                onChange={(e) => setShowOptions({...showOptions, [key]: e.target.checked})}
                className="rounded"
              />
              {label}
            </label>
          ))}
        </div>

        {/* Campo */}
        <div className="flex-1 overflow-auto p-6">
          <div 
            className={`relative ${fieldColors[fieldColor]} rounded-lg shadow-2xl mx-auto`}
            style={{ 
              width: `${zoom}%`,
              paddingBottom: `${zoom * 1.4}%`, // Aspect ratio campo calcio
              maxWidth: '900px'
            }}
          >
            {/* Linee Campo */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
              {/* Bordo esterno */}
              <rect x="2" y="2" width="96" height="136" fill="none" stroke="white" strokeWidth="0.3" />
              
              {/* Linea metà campo */}
              <line x1="2" y1="70" x2="98" y2="70" stroke="white" strokeWidth="0.3" />
              <circle cx="50" cy="70" r="10" fill="none" stroke="white" strokeWidth="0.3" />
              <circle cx="50" cy="70" r="0.5" fill="white" />
              
              {/* Area di rigore superiore */}
              <rect x="20" y="2" width="60" height="18" fill="none" stroke="white" strokeWidth="0.3" />
              <rect x="35" y="2" width="30" height="8" fill="none" stroke="white" strokeWidth="0.3" />
              <circle cx="50" cy="13" r="0.5" fill="white" />
              
              {/* Area di rigore inferiore */}
              <rect x="20" y="120" width="60" height="18" fill="none" stroke="white" strokeWidth="0.3" />
              <rect x="35" y="130" width="30" height="8" fill="none" stroke="white" strokeWidth="0.3" />
              <circle cx="50" cy="127" r="0.5" fill="white" />
              
              {/* Porte */}
              <rect x="45" y="0" width="10" height="2" fill="none" stroke="white" strokeWidth="0.3" />
              <rect x="45" y="138" width="10" height="2" fill="none" stroke="white" strokeWidth="0.3" />
            </svg>

            {/* Pallini Posizionali */}
            {allPositions.map((pos) => {
              const assignedPlayer = assignedPlayers.find(ap => ap.posKey === pos.posKey);
              
              return (
                <div
                  key={pos.posKey}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedPlayer) {
                      assignPlayerToPosition(draggedPlayer, pos.posKey);
                      setDraggedPlayer(null);
                    }
                  }}
                >
                  {assignedPlayer ? (
                    <div 
                      className="relative group"
                      draggable
                      onDragStart={() => setDraggedPlayer(assignedPlayer.player.id)}
                    >
                      <div 
                        className="rounded-lg shadow-lg p-2 min-w-[140px] border-2 cursor-move transition-all hover:scale-105"
                        style={{
                          backgroundColor: playerColors[assignedPlayer.player.id]?.bg || '#FFFFFF',
                          color: playerColors[assignedPlayer.player.id]?.text || '#000000',
                          borderColor: playerColors[assignedPlayer.player.id]?.bg || '#3B82F6'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {showOptions.photo && (
                            assignedPlayer.player.profile_image ? (
                              <img
                                src={assignedPlayer.player.profile_image}
                                alt={assignedPlayer.player.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {assignedPlayer.player.name?.[0] || '?'}
                              </div>
                            )
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs truncate">
                              {assignedPlayer.player.name}
                            </p>
                            {showOptions.age && assignedPlayer.player.birth_year && (
                              <p className="text-[10px] opacity-80">{currentYear - assignedPlayer.player.birth_year} anni</p>
                            )}
                            {showOptions.club && assignedPlayer.player.team && (
                              <p className="text-[10px] opacity-80 truncate">{assignedPlayer.player.team}</p>
                            )}
                            {showOptions.shirtNumber && assignedPlayer.player.shirt_number && (
                              <p className="text-[10px] opacity-80">#{assignedPlayer.player.shirt_number}</p>
                            )}
                            {showOptions.marketValue && assignedPlayer.player.market_value && (
                              <p className="text-[10px] font-semibold opacity-90">{assignedPlayer.player.market_value}</p>
                            )}
                            {showOptions.height && assignedPlayer.player.height_cm && (
                              <p className="text-[10px] opacity-80">{assignedPlayer.player.height_cm}cm</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Pulsanti azione */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => setSelectedPlayerForColor(assignedPlayer.player)}
                          className="bg-purple-600 text-white p-1 rounded-full shadow-lg hover:bg-purple-700"
                          title="Cambia colore"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removePlayerFromPosition(pos.posKey)}
                          className="bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700"
                          title="Rimuovi"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full bg-white bg-opacity-40 border-2 border-white border-dashed flex items-center justify-center cursor-pointer hover:bg-opacity-60 transition-all"
                      title={`Posizione ${pos.role}`}
                    >
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer con giocatori non assegnati */}
        {unassignedPlayers.length > 0 && (
          <div className="bg-gray-800 px-6 py-4 rounded-b-xl border-t border-gray-700">
            <h3 className="text-white font-semibold mb-2">Giocatori disponibili (trascina sul campo):</h3>
            <div className="flex flex-wrap gap-2">
              {unassignedPlayers.map(player => (
                <div
                  key={player.id}
                  draggable
                  onDragStart={() => setDraggedPlayer(player.id)}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 cursor-move hover:bg-gray-600 transition-all"
                  style={{
                    backgroundColor: playerColors[player.id]?.bg || undefined,
                    color: playerColors[player.id]?.text || undefined
                  }}
                >
                  {showOptions.photo && player.profile_image && (
                    <img
                      src={player.profile_image}
                      alt={player.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span>{player.name}</span>
                  <span className="text-xs opacity-70">({player.general_role})</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlayerForColor(player);
                    }}
                    className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    title="Cambia colore"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Selezione Colore */}
      {selectedPlayerForColor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Colore per {selectedPlayerForColor.name}
            </h3>
            
            <div className="space-y-2 mb-4">
              {colorPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPlayerColors(prev => ({
                      ...prev,
                      [selectedPlayerForColor.id]: {
                        bg: preset.color,
                        text: preset.textColor
                      }
                    }));
                    setSelectedPlayerForColor(null);
                  }}
                  className="w-full p-3 rounded-lg border-2 hover:border-blue-500 transition-all flex items-center justify-between"
                  style={{
                    backgroundColor: preset.color,
                    color: preset.textColor
                  }}
                >
                  <span className="font-semibold">{preset.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-current" style={{ backgroundColor: preset.color }} />
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPlayerColors(prev => {
                    const newColors = { ...prev };
                    delete newColors[selectedPlayerForColor.id];
                    return newColors;
                  });
                  setSelectedPlayerForColor(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Rimuovi Colore
              </button>
              <button
                onClick={() => setSelectedPlayerForColor(null)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormationField;
