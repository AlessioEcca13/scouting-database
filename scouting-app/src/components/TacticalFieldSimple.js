// src/components/TacticalFieldSimple.js - Complete tactical field
import React, { useState, useEffect } from 'react';
import { translateRole, translatePosition, translateFoot } from '../utils/translate';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

// Map Italian abbreviations -> English
const roleMapping = {
  // Goalkeepers
  'P': 'GK',
  'POR': 'GK',
  
  // Defenders
  'TS': 'LB',  // Left Back
  'TD': 'RB',  // Right Back
  'DCS': 'LCB', // Left Center Back
  'DCD': 'RCB', // Right Center Back
  'DC': 'CB',   // Center Back
  'ES': 'LWB',  // Left Wing Back
  'ED': 'RWB',  // Right Wing Back
  
  // Midfielders
  'MS': 'LCM',  // Left Center Mid
  'MD': 'RCM',  // Right Center Mid
  'CC': 'CM',   // Center Mid
  'MED': 'CDM', // Defensive Mid
  'REG': 'CM',  // Playmaker
  'TRQ': 'CAM', // Attacking Mid
  
  // Forwards
  'AS': 'LW',   // Left Winger
  'AD': 'RW',   // Right Winger
  'EST': 'LM',  // Wide Mid (generic)
  'PC': 'ST',   // Center Forward
  'AT': 'ST',   // Striker
  'SS': 'SS',   // Second Striker
};

// Function to convert Italian role to English
const normalizeRole = (role) => {
  if (!role) return null;
  
  // If it's already an English abbreviation, return it
  if (role.length <= 3 && role === role.toUpperCase()) {
    return roleMapping[role] || role;
  }
  
  // Otherwise search by full name
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes('portiere')) return 'GK';
  if (roleLower.includes('terzino sin') || roleLower === 'ts') return 'LB';
  if (roleLower.includes('terzino des') || roleLower === 'td') return 'RB';
  if (roleLower.includes('difensore centrale sin') || roleLower === 'dcs') return 'LCB';
  if (roleLower.includes('difensore centrale des') || roleLower === 'dcd') return 'RCB';
  if (roleLower.includes('difensore centrale') || roleLower === 'dc') return 'CB';
  if (roleLower.includes('esterno sin') || roleLower === 'es') return 'LWB';
  if (roleLower.includes('esterno des') || roleLower === 'ed') return 'RWB';
  if (roleLower.includes('mezzala sin') || roleLower === 'ms') return 'LCM';
  if (roleLower.includes('mezzala des') || roleLower === 'md') return 'RCM';
  if (roleLower.includes('centrocampista centrale') || roleLower === 'cc') return 'CM';
  if (roleLower.includes('mediano') || roleLower === 'med') return 'CDM';
  if (roleLower.includes('regista') || roleLower === 'reg') return 'CM';
  if (roleLower.includes('trequartista') || roleLower === 'trq') return 'CAM';
  if (roleLower.includes('ala sin') || roleLower === 'as') return 'LW';
  if (roleLower.includes('ala des') || roleLower === 'ad') return 'RW';
  if (roleLower.includes('punta centrale') || roleLower === 'pc') return 'ST';
  if (roleLower.includes('attaccante') || roleLower === 'at') return 'ST';
  if (roleLower.includes('seconda punta') || roleLower === 'ss') return 'SS';
  
  return null;
};

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
  default: { name: 'None', bg: '#ffffff', border: '#ffffff', text: '#1f2937' }
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
  
  // Stati per salvataggio/caricamento formazioni
  const [savedFormations, setSavedFormations] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [formationName, setFormationName] = useState('');
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
    loadSavedFormations();
  }, []);

  const fetchAllPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');
      if (error) throw error;
      console.log('✅ Giocatori caricati:', data?.length || 0);
      setAllPlayers(data || []);
    } catch (error) {
      console.error('❌ Errore caricamento giocatori:', error);
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
    
    // Set per tracciare i giocatori già aggiunti in questa sessione di import
    const addedInThisImport = new Set();
    
    // Set per tracciare combinazioni uniche (nome + squadra + età)
    const addedPlayerSignatures = new Set();
    
    // Popola le signatures dei giocatori già sul campo
    Object.values(newAssignments).forEach(playerIds => {
      playerIds.forEach(id => {
        const existingPlayer = allPlayers.find(p => p.id === id);
        if (existingPlayer) {
          const signature = `${existingPlayer.name?.toLowerCase()}_${existingPlayer.team?.toLowerCase()}_${existingPlayer.birth_year}`;
          addedPlayerSignatures.add(signature);
        }
      });
    });

    playersToImport.forEach(player => {
      // Crea signature univoca per questo giocatore
      const playerSignature = `${player.name?.toLowerCase()}_${player.team?.toLowerCase()}_${player.birth_year}`;
      
      // Verifica se giocatore con stessa signature già aggiunto
      if (addedPlayerSignatures.has(playerSignature)) {
        console.log(`⚠️ Duplicato rilevato: ${player.name} (${player.team}) - saltato`);
        return; // Salta questo giocatore
      }
      
      // Verifica se il giocatore è già stato aggiunto in questa sessione (per ID)
      if (addedInThisImport.has(player.id)) {
        return; // Salta questo giocatore
      }
      
      // Verifica se il giocatore è già presente in qualsiasi posizione (per ID)
      const isAlreadyOnField = Object.values(newAssignments).some(
        playerIds => playerIds && playerIds.includes(player.id)
      );
      
      if (isAlreadyOnField) {
        return; // Salta questo giocatore
      }
      
      // Usa specific_position se disponibile, altrimenti general_role
      const playerRole = player.specific_position || player.general_role;
      const normalizedRole = normalizeRole(playerRole);
      
      // Cerca una posizione che corrisponda al ruolo normalizzato
      const matchingPos = currentFormation.find(pos => {
        if (!normalizedRole) return false;
        
        // Match esatto
        if (pos.role_abbr === normalizedRole) return true;
        
        // Match per categoria (fallback se non c'è match esatto)
        const posRole = pos.role_abbr?.toLowerCase();
        const normRole = normalizedRole.toLowerCase();
        
        // Portieri
        if (normRole === 'gk') return posRole === 'gk';
        
        // Difensori
        if (['lb', 'lcb', 'cb', 'rcb', 'rb', 'lwb', 'rwb'].includes(normRole)) {
          return posRole?.includes('cb') || posRole?.includes('lb') || posRole?.includes('rb') || posRole?.includes('wb');
        }
        
        // Centrocampisti
        if (['lcm', 'cm', 'rcm', 'cdm', 'ldm', 'rdm', 'cam', 'lam', 'ram'].includes(normRole)) {
          return posRole?.includes('cm') || posRole?.includes('dm') || posRole?.includes('am');
        }
        
        // Attaccanti
        if (['lw', 'rw', 'st', 'cf', 'ss', 'ls', 'rs'].includes(normRole)) {
          return posRole?.includes('w') || posRole?.includes('st') || posRole?.includes('s') || posRole?.includes('cf');
        }
        
        return false;
      });

      if (matchingPos) {
        const posKey = `${matchingPos.role_abbr}_${matchingPos.x}_${matchingPos.y}`;
        
        // IMPORTANTE: Rimuovi il giocatore da TUTTE le posizioni prima di aggiungerlo
        Object.keys(newAssignments).forEach(key => {
          newAssignments[key] = newAssignments[key].filter(id => id !== player.id);
        });
        
        // Ora aggiungi alla nuova posizione
        if (!newAssignments[posKey]) newAssignments[posKey] = [];
        newAssignments[posKey].push(player.id);
        addedInThisImport.add(player.id); // Marca come aggiunto per ID
        addedPlayerSignatures.add(playerSignature); // Marca come aggiunto per signature
        importedCount++;
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
    setPositionAssignments(prev => {
      // Trova e rimuovi il giocatore da qualsiasi posizione precedente
      const newAssignments = {};
      Object.keys(prev).forEach(key => {
        newAssignments[key] = prev[key].filter(id => id !== playerId);
      });
      
      // Aggiungi il giocatore alla nuova posizione
      const current = newAssignments[posKey] || [];
      newAssignments[posKey] = [...current, playerId];
      
      return newAssignments;
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

  // ========================================
  // SALVATAGGIO/CARICAMENTO FORMAZIONI
  // ========================================
  
  const loadSavedFormations = async () => {
    try {
      const { data, error } = await supabase
        .from('tactical_formations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSavedFormations(data || []);
    } catch (error) {
      console.error('Errore caricamento formazioni:', error);
    }
  };

  const saveFormation = async () => {
    if (!formationName.trim()) {
      toast.error('Inserisci un nome per la formazione!');
      return;
    }

    if (Object.keys(positionAssignments).length === 0) {
      toast.error('Posiziona almeno un giocatore sul campo!');
      return;
    }

    try {
      const { error } = await supabase
        .from('tactical_formations')
        .insert({
          name: formationName.trim(),
          formation_type: formation,
          position_assignments: positionAssignments,
          player_colors: playerColors,
          display_attributes: displayAttributes,
          field_color: fieldColor
        });

      if (error) throw error;

      toast.success(`✅ Formazione "${formationName}" salvata!`);
      setFormationName('');
      setShowSaveModal(false);
      loadSavedFormations();
    } catch (error) {
      console.error('Errore salvataggio formazione:', error);
      toast.error('Errore nel salvataggio della formazione');
    }
  };

  const loadFormation = async (savedFormation) => {
    try {
      setFormation(savedFormation.formation_type);
      setPositionAssignments(savedFormation.position_assignments || {});
      setPlayerColors(savedFormation.player_colors || {});
      setDisplayAttributes(savedFormation.display_attributes || {
        team: true,
        age: false,
        role: true,
        value: false
      });
      setFieldColor(savedFormation.field_color || 'green');
      
      toast.success(`✅ Formazione "${savedFormation.name}" caricata!`);
      setShowLoadModal(false);
    } catch (error) {
      console.error('Errore caricamento formazione:', error);
      toast.error('Errore nel caricamento della formazione');
    }
  };

  const deleteFormation = async (id, name) => {
    if (!window.confirm(`Vuoi eliminare la formazione "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('tactical_formations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(`🗑️ Formazione "${name}" eliminata!`);
      loadSavedFormations();
    } catch (error) {
      console.error('Errore eliminazione formazione:', error);
      toast.error('Errore nell\'eliminazione della formazione');
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
      info.push(`${age} years`);
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
    
    return info.length > 0 ? info.join(' • ') : 'N/A';
  };

  const getFilteredPlayers = () => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    const filtered = allPlayers.filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.team?.toLowerCase().includes(term) ||
      p.general_role?.toLowerCase().includes(term)
    );
    console.log(`🔍 Ricerca "${searchTerm}": ${filtered.length} risultati su ${allPlayers.length} giocatori`);
    return filtered;
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
    <div className="p-6 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">⚽ Campo Tattico Professionale</h1>
        <p className="text-gray-600 text-lg">Crea e gestisci le tue formazioni tattiche</p>
      </div>

      {/* Layout a 2 colonne: Campo + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
        
        {/* COLONNA SINISTRA: Campo + Ricerca */}
        <div className="space-y-6">
          
          {/* Barra Ricerca Compatta */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Cerca giocatore per nome, squadra o ruolo..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>
              <select
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700"
              >
                {Object.keys(formations).map(f => (
                  <option key={f} value={f}>📋 {f}</option>
                ))}
              </select>
            </div>
          </div>

      {/* Risultati Ricerca - SPOSTATO PRIMA DEL CAMPO */}
      {searchTerm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🔍 Risultati Ricerca ({filteredPlayers.length})
          </h3>
          
          {filteredPlayers.length > 0 ? (
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
                      <p className="text-xs text-gray-500">{translateRole(player.general_role)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">❌ Nessun giocatore trovato per "{searchTerm}"</p>
              <p className="text-gray-400 text-sm mt-2">Prova con un altro nome, squadra o ruolo</p>
            </div>
          )}
        </div>
      )}

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
                                title="Remove"
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
        </div>

        {/* COLONNA DESTRA: Sidebar Controlli */}
        <div className="space-y-6">
          
          {/* Azioni Rapide */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>⚡</span> Azioni Rapide
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={Object.keys(positionAssignments).length === 0}
                className="w-full px-4 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                💾 Salva Formazione
              </button>
              <button
                onClick={() => setShowLoadModal(true)}
                disabled={savedFormations.length === 0}
                className="w-full px-4 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                📂 Carica Formazione
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="w-full px-4 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                📥 Importa da Liste
              </button>
              <button
                onClick={clearField}
                disabled={Object.keys(positionAssignments).length === 0}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                🗑️ Svuota Campo
              </button>
            </div>
          </div>

          {/* Personalizzazione */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎨</span> Personalizzazione
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Colore Campo</label>
                <select
                  value={fieldColor}
                  onChange={(e) => setFieldColor(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="green">🟢 Verde Classico</option>
                  <option value="blue">🔵 Blu</option>
                  <option value="red">🔴 Rosso</option>
                  <option value="gray">⚫ Grigio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Mostra Attributi</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={displayAttributes.team}
                      onChange={() => toggleAttribute('team')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">🏟️ Squadra</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={displayAttributes.age}
                      onChange={() => toggleAttribute('age')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">🎂 Età</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={displayAttributes.role}
                      onChange={() => toggleAttribute('role')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">⚽ Ruolo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={displayAttributes.value}
                      onChange={() => toggleAttribute('value')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">💰 Valore</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiche */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span> Statistiche
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Modulo:</span>
                <span className="text-blue-600 font-bold text-lg">{formation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Giocatori:</span>
                <span className="text-green-600 font-bold text-lg">{assignedIds.size}/11</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Formazioni salvate:</span>
                <span className="text-purple-600 font-bold text-lg">{savedFormations.length}</span>
              </div>
            </div>
          </div>

          {/* Legenda Colori Compatta */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎨</span> Legenda Colori
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(playerColorCategories).filter(([key]) => key !== 'default').map(([key, cat]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 p-2 rounded-lg border-2 text-xs"
                  style={{
                    backgroundColor: cat.bg,
                    borderColor: cat.border
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full border-2 flex-shrink-0" 
                    style={{ 
                      backgroundColor: cat.bg,
                      borderColor: cat.border
                    }} 
                  />
                  <span className="font-semibold truncate" style={{ color: cat.text }}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Legenda Colori Mobile (nascosta su desktop) */}
      <div className="xl:hidden bg-white rounded-xl shadow-lg p-6 mb-6">
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

      {/* Modal Salva Formazione */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">💾 Salva Formazione</h3>
            <p className="text-sm text-gray-600 mb-4">Dai un nome alla tua formazione per salvarla</p>
            
            <input
              type="text"
              value={formationName}
              onChange={(e) => setFormationName(e.target.value)}
              placeholder="Nome formazione (es: 4-3-3 Offensivo)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === 'Enter' && saveFormation()}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setFormationName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Annulla
              </button>
              <button
                onClick={saveFormation}
                disabled={!formationName.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Carica Formazione */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📂 Carica Formazione</h3>
            <p className="text-sm text-gray-600 mb-4">Seleziona una formazione salvata</p>
            
            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
              {savedFormations.map(formation => (
                <div key={formation.id} className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-purple-500 transition-all">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{formation.name}</p>
                    <p className="text-sm text-gray-600">
                      {formation.formation_type} • {Object.keys(formation.position_assignments || {}).length} giocatori
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(formation.created_at).toLocaleDateString('it-IT', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => loadFormation(formation)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                  >
                    Carica
                  </button>
                  <button
                    onClick={() => deleteFormation(formation.id, formation.name)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowLoadModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TacticalFieldSimple;
