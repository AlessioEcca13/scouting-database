// src/components/TacticalFieldSimple.js - Campo tattico completo
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

const formations = {
  '4-3-3': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LB', x: 20, y: 25 },
    { role_abbr: 'LCB', x: 38, y: 25 },
    { role_abbr: 'RCB', x: 62, y: 25 },
    { role_abbr: 'RB', x: 80, y: 25 },
    { role_abbr: 'LCM', x: 35, y: 45 },
    { role_abbr: 'CM', x: 50, y: 45 },
    { role_abbr: 'RCM', x: 65, y: 45 },
    { role_abbr: 'LW', x: 25, y: 70 },
    { role_abbr: 'ST', x: 50, y: 75 },
    { role_abbr: 'RW', x: 75, y: 70 }
  ],
  '4-2-3-1': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LB', x: 20, y: 25 },
    { role_abbr: 'LCB', x: 38, y: 25 },
    { role_abbr: 'RCB', x: 62, y: 25 },
    { role_abbr: 'RB', x: 80, y: 25 },
    { role_abbr: 'LDM', x: 42, y: 40 },
    { role_abbr: 'RDM', x: 58, y: 40 },
    { role_abbr: 'LAM', x: 40, y: 55 },
    { role_abbr: 'CAM', x: 50, y: 58 },
    { role_abbr: 'RAM', x: 60, y: 55 },
    { role_abbr: 'ST', x: 50, y: 75 }
  ],
  '4-4-2': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LB', x: 20, y: 25 },
    { role_abbr: 'LCB', x: 38, y: 25 },
    { role_abbr: 'RCB', x: 62, y: 25 },
    { role_abbr: 'RB', x: 80, y: 25 },
    { role_abbr: 'LM', x: 30, y: 45 },
    { role_abbr: 'LCM', x: 44, y: 45 },
    { role_abbr: 'RCM', x: 56, y: 45 },
    { role_abbr: 'RM', x: 70, y: 45 },
    { role_abbr: 'LS', x: 45, y: 70 },
    { role_abbr: 'RS', x: 55, y: 70 }
  ],
  '4-3-1-2': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LB', x: 20, y: 25 },
    { role_abbr: 'LCB', x: 38, y: 25 },
    { role_abbr: 'RCB', x: 62, y: 25 },
    { role_abbr: 'RB', x: 80, y: 25 },
    { role_abbr: 'LCM', x: 38, y: 45 },
    { role_abbr: 'CM', x: 50, y: 45 },
    { role_abbr: 'RCM', x: 62, y: 45 },
    { role_abbr: 'CAM', x: 50, y: 58 },
    { role_abbr: 'LS', x: 45, y: 72 },
    { role_abbr: 'RS', x: 55, y: 72 }
  ],
  '3-5-2': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LCB', x: 30, y: 25 },
    { role_abbr: 'CB', x: 50, y: 25 },
    { role_abbr: 'RCB', x: 70, y: 25 },
    { role_abbr: 'LWB', x: 20, y: 45 },
    { role_abbr: 'LCM', x: 38, y: 45 },
    { role_abbr: 'CM', x: 50, y: 45 },
    { role_abbr: 'RCM', x: 62, y: 45 },
    { role_abbr: 'RWB', x: 80, y: 45 },
    { role_abbr: 'SS', x: 45, y: 68 },
    { role_abbr: 'ST', x: 55, y: 75 }
  ],
  '3-4-3': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LCB', x: 30, y: 25 },
    { role_abbr: 'CB', x: 50, y: 25 },
    { role_abbr: 'RCB', x: 70, y: 25 },
    { role_abbr: 'LWB', x: 25, y: 45 },
    { role_abbr: 'LCM', x: 42, y: 45 },
    { role_abbr: 'RCM', x: 58, y: 45 },
    { role_abbr: 'RWB', x: 75, y: 45 },
    { role_abbr: 'LW', x: 35, y: 70 },
    { role_abbr: 'ST', x: 50, y: 75 },
    { role_abbr: 'RW', x: 65, y: 70 }
  ],
  '3-4-2-1': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LCB', x: 30, y: 25 },
    { role_abbr: 'CB', x: 50, y: 25 },
    { role_abbr: 'RCB', x: 70, y: 25 },
    { role_abbr: 'LWB', x: 25, y: 45 },
    { role_abbr: 'LCM', x: 42, y: 45 },
    { role_abbr: 'RCM', x: 58, y: 45 },
    { role_abbr: 'RWB', x: 75, y: 45 },
    { role_abbr: 'LAM', x: 42, y: 60 },
    { role_abbr: 'RAM', x: 58, y: 60 },
    { role_abbr: 'ST', x: 50, y: 75 }
  ],
  '5-3-2': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LWB', x: 15, y: 25 },
    { role_abbr: 'LCB', x: 30, y: 25 },
    { role_abbr: 'CB', x: 50, y: 25 },
    { role_abbr: 'RCB', x: 70, y: 25 },
    { role_abbr: 'RWB', x: 85, y: 25 },
    { role_abbr: 'LCM', x: 38, y: 45 },
    { role_abbr: 'CM', x: 50, y: 45 },
    { role_abbr: 'RCM', x: 62, y: 45 },
    { role_abbr: 'LS', x: 45, y: 70 },
    { role_abbr: 'RS', x: 55, y: 70 }
  ],
  '5-4-1': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LWB', x: 15, y: 25 },
    { role_abbr: 'LCB', x: 30, y: 25 },
    { role_abbr: 'CB', x: 50, y: 25 },
    { role_abbr: 'RCB', x: 70, y: 25 },
    { role_abbr: 'RWB', x: 85, y: 25 },
    { role_abbr: 'LM', x: 30, y: 45 },
    { role_abbr: 'LCM', x: 45, y: 45 },
    { role_abbr: 'RCM', x: 55, y: 45 },
    { role_abbr: 'RM', x: 70, y: 45 },
    { role_abbr: 'ST', x: 50, y: 70 }
  ],
  '4-1-4-1': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LB', x: 20, y: 25 },
    { role_abbr: 'LCB', x: 38, y: 25 },
    { role_abbr: 'RCB', x: 62, y: 25 },
    { role_abbr: 'RB', x: 80, y: 25 },
    { role_abbr: 'CDM', x: 50, y: 38 },
    { role_abbr: 'LM', x: 30, y: 50 },
    { role_abbr: 'LCM', x: 44, y: 50 },
    { role_abbr: 'RCM', x: 56, y: 50 },
    { role_abbr: 'RM', x: 70, y: 50 },
    { role_abbr: 'ST', x: 50, y: 75 }
  ],
  '4-5-1': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LB', x: 20, y: 25 },
    { role_abbr: 'LCB', x: 38, y: 25 },
    { role_abbr: 'RCB', x: 62, y: 25 },
    { role_abbr: 'RB', x: 80, y: 25 },
    { role_abbr: 'LM', x: 25, y: 45 },
    { role_abbr: 'LCM', x: 40, y: 45 },
    { role_abbr: 'CM', x: 50, y: 45 },
    { role_abbr: 'RCM', x: 60, y: 45 },
    { role_abbr: 'RM', x: 75, y: 45 },
    { role_abbr: 'ST', x: 50, y: 72 }
  ],
  '4-1-3-2': [
    { role_abbr: 'GK', x: 50, y: 5 },
    { role_abbr: 'LB', x: 20, y: 25 },
    { role_abbr: 'LCB', x: 38, y: 25 },
    { role_abbr: 'RCB', x: 62, y: 25 },
    { role_abbr: 'RB', x: 80, y: 25 },
    { role_abbr: 'CDM', x: 50, y: 40 },
    { role_abbr: 'LAM', x: 40, y: 52 },
    { role_abbr: 'CAM', x: 50, y: 55 },
    { role_abbr: 'RAM', x: 60, y: 52 },
    { role_abbr: 'LS', x: 45, y: 72 },
    { role_abbr: 'RS', x: 55, y: 72 }
  ]
};

const playerColorCategories = {
  scadenza: { name: 'Scadenza 2025', bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
  priorita: { name: 'Priorità Alta', bg: '#fecaca', border: '#ef4444', text: '#7f1d1d' },
  under: { name: 'Under', bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
  prestito: { name: 'In Prestito', bg: '#e9d5ff', border: '#a855f7', text: '#581c87' },
  svincolato: { name: 'Svincolato', bg: '#d1fae5', border: '#10b981', text: '#064e3b' },
  titolare: { name: 'Titolare', bg: '#fed7aa', border: '#f97316', text: '#7c2d12' },
  default: { name: 'Nessuno', bg: '#ffffff', border: '#ffffff', text: '#1f2937' }
};

function TacticalFieldSimple() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [lists, setLists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formation, setFormation] = useState('4-3-3');
  const [positionAssignments, setPositionAssignments] = useState({});
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedListsToImport, setSelectedListsToImport] = useState([]);
  const [playerColors, setPlayerColors] = useState({});
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedPlayerForColor, setSelectedPlayerForColor] = useState(null);
  const [fieldColor, setFieldColor] = useState('green');
  const [displayAttributes, setDisplayAttributes] = useState({
    team: true,
    age: false,
    role: false,
    value: false
  });

  useEffect(() => {
    fetchAllPlayers();
    fetchLists();
  }, []);

  const fetchAllPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');
      if (error) throw error;
      setAllPlayers(data || []);
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore caricamento giocatori');
    }
  };

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('player_lists')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const importPlayersFromLists = () => {
    if (selectedListsToImport.length === 0) {
      toast.error('Seleziona almeno una lista');
      return;
    }

    // Usa Set per evitare duplicati automaticamente
    const playerIds = new Set();
    selectedListsToImport.forEach(listId => {
      const list = lists.find(l => l.id === listId);
      if (list?.player_ids) {
        list.player_ids.forEach(id => playerIds.add(id));
      }
    });

    // Filtra solo i giocatori non già presenti sul campo
    const alreadyAssignedIds = new Set();
    Object.values(positionAssignments).forEach(ids => {
      ids.forEach(id => alreadyAssignedIds.add(id));
    });

    const playersToImport = allPlayers.filter(p => 
      playerIds.has(p.id) && !alreadyAssignedIds.has(p.id)
    );

    if (playersToImport.length === 0) {
      toast.info('Tutti i giocatori delle liste selezionate sono già sul campo');
      setShowImportModal(false);
      setSelectedListsToImport([]);
      return;
    }

    const newAssignments = { ...positionAssignments };
    const currentFormation = formations[formation];
    let importedCount = 0;

    playersToImport.forEach(player => {
      const matchingPos = currentFormation.find(pos => {
        const roleMatch = player.general_role?.toLowerCase() || '';
        const posRole = pos.role_abbr?.toLowerCase();
        
        if (roleMatch.includes('portiere') || roleMatch.includes('gk')) return posRole === 'gk';
        if (roleMatch.includes('difens') || roleMatch.includes('terzin')) {
          return posRole?.includes('cb') || posRole?.includes('lb') || posRole?.includes('rb') || posRole?.includes('wb');
        }
        if (roleMatch.includes('centroc') || roleMatch.includes('mediano')) {
          return posRole?.includes('cm') || posRole?.includes('dm') || posRole?.includes('cdm');
        }
        if (roleMatch.includes('attacc') || roleMatch.includes('punta')) {
          return posRole?.includes('st') || posRole?.includes('cf') || posRole?.includes('s');
        }
        if (roleMatch.includes('ala') || roleMatch.includes('esterno')) {
          return posRole?.includes('w') || posRole?.includes('m');
        }
        return false;
      });

      if (matchingPos) {
        const posKey = `${matchingPos.role_abbr}_${matchingPos.x}_${matchingPos.y}`;
        if (!newAssignments[posKey]) newAssignments[posKey] = [];
        // Doppio controllo per evitare duplicati
        if (!newAssignments[posKey].includes(player.id)) {
          newAssignments[posKey].push(player.id);
          importedCount++;
        }
      }
    });

    setPositionAssignments(newAssignments);
    setShowImportModal(false);
    setSelectedListsToImport([]);
    
    if (importedCount > 0) {
      toast.success(`${importedCount} giocatori importati (duplicati esclusi)`);
    } else {
      toast.info('Nessun nuovo giocatore da importare');
    }
  };

  const assignPlayerToPosition = (playerId, posKey) => {
    // Controlla se il giocatore è già presente in qualsiasi posizione
    const isPlayerAlreadyAssigned = Object.values(positionAssignments).some(
      playerIds => playerIds && playerIds.includes(playerId)
    );
    
    if (isPlayerAlreadyAssigned) {
      toast.error('Giocatore già presente sul campo');
      return;
    }
    
    setPositionAssignments(prev => {
      const current = prev[posKey] || [];
      return { ...prev, [posKey]: [...current, playerId] };
    });
  };

  const removePlayerFromPosition = (posKey, playerId) => {
    setPositionAssignments(prev => {
      const current = prev[posKey] || [];
      return { ...prev, [posKey]: current.filter(id => id !== playerId) };
    });
  };

  const clearField = () => {
    if (window.confirm('Vuoi davvero svuotare il campo?')) {
      setPositionAssignments({});
      toast.success('Campo svuotato!');
    }
  };

  const toggleAttribute = (attr) => {
    setDisplayAttributes(prev => ({
      ...prev,
      [attr]: !prev[attr]
    }));
  };

  const getPlayerDisplayInfo = (player) => {
    const info = [];
    
    if (displayAttributes.team && player.team) {
      info.push(player.team);
    }
    
    if (displayAttributes.age && player.birth_year) {
      const age = new Date().getFullYear() - player.birth_year;
      info.push(`${age} anni`);
    }
    
    if (displayAttributes.role) {
      const role = player.specific_position || player.general_role;
      if (role) info.push(role);
    }
    
    if (displayAttributes.value && player.market_value) {
      const value = typeof player.market_value === 'number' ? player.market_value : parseFloat(player.market_value);
      if (value >= 1000000) {
        info.push(`€${(value / 1000000).toFixed(1)}M`);
      } else if (value >= 1000) {
        info.push(`€${(value / 1000).toFixed(0)}K`);
      } else {
        info.push(`€${value}`);
      }
    }
    
    return info.length > 0 ? info.join(' • ') : 'N/D';
  };

  const getFilteredPlayers = () => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return allPlayers.filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.team?.toLowerCase().includes(term) ||
      p.general_role?.toLowerCase().includes(term)
    );
  };

  const getAssignedPlayerIds = () => {
    const ids = new Set();
    Object.values(positionAssignments).forEach(playerIds => {
      playerIds.forEach(id => ids.add(id));
    });
    return ids;
  };

  const currentFormation = formations[formation];
  const filteredPlayers = getFilteredPlayers();
  const assignedIds = getAssignedPlayerIds();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">⚽ Campo Tattico</h1>
        <p className="text-gray-600">Cerca e posiziona giocatori sul campo</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Cerca Giocatore</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, squadra o ruolo..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📋 Modulo</label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(formations).map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🎨 Colore Campo</label>
            <select
              value={fieldColor}
              onChange={(e) => setFieldColor(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="green">Verde Classico</option>
              <option value="blue">Blu</option>
              <option value="red">Rosso</option>
              <option value="gray">Grigio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📊 Mostra Attributi</label>
            <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={displayAttributes.team}
                  onChange={() => toggleAttribute('team')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">🏟️ Squadra</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={displayAttributes.age}
                  onChange={() => toggleAttribute('age')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">🎂 Età</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={displayAttributes.role}
                  onChange={() => toggleAttribute('role')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">⚽ Ruolo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={displayAttributes.value}
                  onChange={() => toggleAttribute('value')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">💰 Valore</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              📥 Importa
            </button>
            <button
              onClick={clearField}
              disabled={Object.keys(positionAssignments).length === 0}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
            >
              🗑️ Svuota
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl p-8 mb-6">
        <div className="flex justify-center">
          <div 
            className="relative rounded-xl shadow-2xl overflow-hidden border-4 border-gray-700"
            style={{ width: '1000px', height: '1400px' }}
          >
            {/* Texture campo - colore dinamico */}
            <div className={`absolute inset-0 ${
              fieldColor === 'green' ? 'bg-gradient-to-b from-green-600 via-green-700 to-green-600' :
              fieldColor === 'blue' ? 'bg-gradient-to-b from-blue-600 via-blue-700 to-blue-600' :
              fieldColor === 'red' ? 'bg-gradient-to-b from-red-600 via-red-700 to-red-600' :
              'bg-gradient-to-b from-gray-600 via-gray-700 to-gray-600'
            }`}></div>
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)'
            }}></div>
            
            {/* Linee campo professionali */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1400" preserveAspectRatio="none">
              {/* Bordo campo */}
              <rect x="50" y="50" width="900" height="1300" fill="none" stroke="white" strokeWidth="4" opacity="0.8"/>
              
              {/* Linea metà campo */}
              <line x1="50" y1="700" x2="950" y2="700" stroke="white" strokeWidth="4" opacity="0.8"/>
              
              {/* Cerchio centrale */}
              <circle cx="500" cy="700" r="100" fill="none" stroke="white" strokeWidth="4" opacity="0.8"/>
              <circle cx="500" cy="700" r="5" fill="white" opacity="0.8"/>
              
              {/* Area rigore superiore (porta avversaria) */}
              <rect x="250" y="50" width="500" height="180" fill="none" stroke="white" strokeWidth="4" opacity="0.8"/>
              <rect x="350" y="50" width="300" height="80" fill="none" stroke="white" strokeWidth="4" opacity="0.8"/>
              <circle cx="500" cy="230" r="5" fill="white" opacity="0.8"/>
              <path d="M 400 230 A 100 100 0 0 0 600 230" fill="none" stroke="white" strokeWidth="4" opacity="0.8"/>
              
              {/* Area rigore inferiore (nostra porta) */}
              <rect x="250" y="1170" width="500" height="180" fill="none" stroke="white" strokeWidth="4" opacity="0.8"/>
              <rect x="350" y="1270" width="300" height="80" fill="none" stroke="white" strokeWidth="4" opacity="0.8"/>
              <circle cx="500" cy="1170" r="5" fill="white" opacity="0.8"/>
              <path d="M 400 1170 A 100 100 0 0 1 600 1170" fill="none" stroke="white" strokeWidth="4" opacity="0.8"/>
              
              {/* Angoli */}
              <path d="M 50 50 Q 70 50 70 70" fill="none" stroke="white" strokeWidth="3" opacity="0.6"/>
              <path d="M 950 50 Q 930 50 930 70" fill="none" stroke="white" strokeWidth="3" opacity="0.6"/>
              <path d="M 50 1350 Q 70 1350 70 1330" fill="none" stroke="white" strokeWidth="3" opacity="0.6"/>
              <path d="M 950 1350 Q 930 1350 930 1330" fill="none" stroke="white" strokeWidth="3" opacity="0.6"/>
            </svg>
            
            {/* Etichette porte */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-red-600 bg-opacity-90 px-6 py-2 rounded-full shadow-lg border-2 border-white">
                <span className="text-white font-bold text-sm tracking-wider">⚽ AVVERSARI</span>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-blue-600 bg-opacity-90 px-6 py-2 rounded-full shadow-lg border-2 border-white">
                <span className="text-white font-bold text-sm tracking-wider">🛡️ NOSTRA PORTA</span>
              </div>
            </div>

            {currentFormation.map((pos) => {
              const posKey = `${pos.role_abbr}_${pos.x}_${pos.y}`;
              const playerIds = positionAssignments[posKey] || [];
              const players = playerIds.map(id => allPlayers.find(p => p.id === id)).filter(Boolean);

              return (
                <div
                  key={posKey}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pos.x}%`, top: `${100 - pos.y}%` }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedPlayer) {
                      assignPlayerToPosition(draggedPlayer, posKey);
                      setDraggedPlayer(null);
                    }
                  }}
                >
                  {players.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {players.map((player, index) => {
                        const colorCategory = playerColors[player.id] || 'default';
                        const colors = playerColorCategories[colorCategory];
                        
                        return (
                          <div
                            key={player.id}
                            draggable
                            onDragStart={() => setDraggedPlayer(player.id)}
                            className="relative group"
                            style={{
                              marginLeft: index > 0 ? `${index * 8}px` : '0',
                              zIndex: 10 + index
                            }}
                          >
                            <div 
                              className="rounded-xl shadow-xl p-3 min-w-[160px] border-3 cursor-move hover:scale-110 hover:shadow-2xl transition-all"
                              style={{
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                                borderWidth: '3px'
                              }}
                            >
                              <div className="flex items-start gap-2">
                                {player.profile_image && (
                                  <img src={player.profile_image} alt={player.name} className="w-10 h-10 rounded-full object-cover border-3 shadow-md flex-shrink-0" style={{ borderColor: colors.border, borderWidth: '3px' }} />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm truncate" style={{ color: colors.text }}>{player.name}</p>
                                  <p className="text-xs leading-relaxed" style={{ color: colors.text, opacity: 0.8, wordBreak: 'break-word' }}>{getPlayerDisplayInfo(player)}</p>
                                </div>
                              </div>
                            </div>
                            <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setSelectedPlayerForColor(player);
                                  setShowColorModal(true);
                                }}
                                className="bg-blue-600 text-white p-1 rounded-full text-[10px] w-5 h-5 flex items-center justify-center"
                                title="Cambia colore"
                              >
                                🎨
                              </button>
                              <button
                                onClick={() => removePlayerFromPosition(posKey, player.id)}
                                className="bg-red-600 text-white p-1 rounded-full text-[10px] w-5 h-5 flex items-center justify-center"
                                title="Rimuovi"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full bg-white bg-opacity-30 border-4 border-white border-dashed flex items-center justify-center cursor-pointer hover:bg-opacity-50 hover:scale-110 transition-all shadow-lg">
                        <span className="text-white text-sm font-bold drop-shadow-lg">{pos.role_abbr}</span>
                      </div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                          Trascina qui
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {filteredPlayers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Risultati Ricerca ({filteredPlayers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => setDraggedPlayer(player.id)}
                className={`p-3 rounded-lg border-2 cursor-move hover:shadow-lg transition-all ${
                  assignedIds.has(player.id) ? 'bg-green-50 border-green-500' : 'bg-white border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {player.profile_image && (
                    <img src={player.profile_image} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{player.name}</p>
                    <p className="text-xs text-gray-600">{player.team}</p>
                    <p className="text-xs text-gray-500">{player.general_role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legenda Colori */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎨 Legenda Colori</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(playerColorCategories).filter(([key]) => key !== 'default').map(([key, cat]) => (
            <div
              key={key}
              className="flex items-center gap-2 p-3 rounded-lg border-2"
              style={{
                backgroundColor: cat.bg,
                borderColor: cat.border
              }}
            >
              <div 
                className="w-4 h-4 rounded-full border-2" 
                style={{ 
                  backgroundColor: cat.bg,
                  borderColor: cat.border
                }} 
              />
              <span className="text-sm font-semibold" style={{ color: cat.text }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Colore */}
      {showColorModal && selectedPlayerForColor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🎨 Colore per {selectedPlayerForColor.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Seleziona una categoria per evidenziare il giocatore
            </p>
            
            <div className="space-y-2 mb-4">
              {Object.entries(playerColorCategories).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => {
                    setPlayerColors(prev => ({
                      ...prev,
                      [selectedPlayerForColor.id]: key
                    }));
                    setShowColorModal(false);
                    setSelectedPlayerForColor(null);
                    toast.success(`Colore "${cat.name}" applicato!`);
                  }}
                  className="w-full p-3 rounded-lg border-2 hover:border-blue-500 transition-all flex items-center justify-between"
                  style={{
                    backgroundColor: cat.bg,
                    borderColor: cat.border
                  }}
                >
                  <span className="font-semibold" style={{ color: cat.text }}>{cat.name}</span>
                  <div 
                    className="w-6 h-6 rounded-full border-2" 
                    style={{ 
                      backgroundColor: cat.bg,
                      borderColor: cat.border
                    }} 
                  />
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowColorModal(false);
                setSelectedPlayerForColor(null);
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📥 Importa da Liste</h3>
            <p className="text-sm text-gray-600 mb-4">Seleziona una o più liste per importare i giocatori</p>
            
            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
              {lists.map(list => (
                <label key={list.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedListsToImport.includes(list.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedListsToImport([...selectedListsToImport, list.id]);
                      } else {
                        setSelectedListsToImport(selectedListsToImport.filter(id => id !== list.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{list.name}</p>
                    <p className="text-xs text-gray-600">{list.player_ids?.length || 0} giocatori</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedListsToImport([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Annulla
              </button>
              <button
                onClick={importPlayersFromLists}
                disabled={selectedListsToImport.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Importa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TacticalFieldSimple;
