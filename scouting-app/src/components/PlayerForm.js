// src/components/PlayerForm.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import AttributeInput from './AttributeInput';
import { getAllStrengths, getAllWeaknesses } from '../data/playerAttributes';
import { 
  generatePlayerUniqueId, 
  findDuplicatePlayers,
  findPlayerByTransfermarktUrl,
  createDuplicateMessage 
} from '../utils/playerDeduplication';

function PlayerForm({ onSave, onCancel }) {
  const [duplicatePlayer, setDuplicatePlayer] = useState(null);
  const [transfermarktUrl, setTransfermarktUrl] = useState('');
  const [isLoadingTransfermarkt, setIsLoadingTransfermarkt] = useState(false);
  const [showReportSection, setShowReportSection] = useState(false);
  
  // State per attributi categorizzati
  const [strengthAttributes, setStrengthAttributes] = useState([]);
  const [weaknessAttributes, setWeaknessAttributes] = useState([]);
  
  // Imposta valori default quando si apre la sezione report
  useEffect(() => {
    if (showReportSection && (!formData.current_value || formData.current_value === '')) {
      setFormData(prev => ({
        ...prev,
        current_value: '3',
        potential_value: '3'
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReportSection]);
  const [formData, setFormData] = useState({
    name: '',
    birth_year: '',
    birth_place: '',
    team: '',
    nationality: '',
    height: '',
    weight: '',
    shirt_number: '',
    general_role: 'Centrocampo',
    preferred_foot: 'Right',
    current_value: '',
    potential_value: '',
    market_value: '',
    contract_expiry: '',
    priority: null, // Solo "Urgente" o null
    recommended_action: 'Monitorare',
    director_feedback: 'Da valutare',
    check_type: 'Live',
    transfermarkt_link: '',
    profile_image: '',
    natural_position: '',
    other_positions: '',
    market_value_updated: '',
    strong_points: '',
    weak_points: '',
    notes: '',
    scouting_date: new Date().toISOString().split('T')[0],
    signaler_name: '',
    scout_name: '',
    scout_role: '',
    match_name: '',
    match_date: '',
    final_rating: 'B',
    athletic_data_rating: '🟡'
  });

  const handleImportFromTransfermarkt = async () => {
    if (!transfermarktUrl.trim()) return;

    try {
      setIsLoadingTransfermarkt(true);
      
      console.log('🔗 Importazione da URL:', transfermarktUrl);
      
      const response = await fetch('http://localhost:5001/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: transfermarktUrl })
      });

      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      
      console.log('📦 Risultato completo API:', result);

      if (!result.success) {
        throw new Error(result.error || 'Errore durante l\'importazione');
      }

      const dbData = result.data;
      
      // Aggiorna solo i campi che hanno un valore valido dall'API
      // IMPORTANTE: Converti tutti i valori in stringhe per mantenere controlled inputs
      setFormData(prev => {
        const updatedData = { ...prev };
        
        // Rimuovi numero maglia dal nome se presente (es: "#29 James Penrice" → "James Penrice")
        if (dbData.name) {
          const cleanName = dbData.name.replace(/^#\d+\s+/, '');
          updatedData.name = String(cleanName);
        }
        
        if (dbData.birth_year !== null && dbData.birth_year !== undefined) {
          updatedData.birth_year = String(dbData.birth_year);
        }
        if (dbData.team) updatedData.team = String(dbData.team);
        if (dbData.nationality_primary) updatedData.nationality = String(dbData.nationality_primary);
        if (dbData.height_cm) updatedData.height = String(dbData.height_cm);
        if (dbData.general_role) updatedData.general_role = String(dbData.general_role);
        if (dbData.specific_position) updatedData.specific_position = String(dbData.specific_position);
        if (dbData.preferred_foot) updatedData.preferred_foot = String(dbData.preferred_foot);
        if (dbData.market_value) updatedData.market_value = String(dbData.market_value);
        if (dbData.contract_expiry) updatedData.contract_expiry = String(dbData.contract_expiry);
        if (dbData.transfermarkt_url) updatedData.transfermarkt_link = String(dbData.transfermarkt_url);
        if (dbData.profile_image) updatedData.profile_image = String(dbData.profile_image);
        if (dbData.other_positions) updatedData.other_positions = String(dbData.other_positions);
        
        return updatedData;
      });

      toast.success(`✅ Dati importati per ${dbData.name}!`, {
        duration: 4000,
        icon: '🌐'
      });

    } catch (error) {
      console.error('Errore importazione Transfermarkt:', error);
      toast.error(`❌ ${error.message}`);
    } finally {
      setIsLoadingTransfermarkt(false);
    }
  };

  const checkDuplicatePlayer = async (playerName, birthYear, nationality = null) => {
    if (!playerName || playerName.trim().length < 3) {
      setDuplicatePlayer(null);
      return;
    }
    
    // Se non c'è l'anno di nascita, non controllare duplicati
    if (!birthYear) {
      setDuplicatePlayer(null);
      return;
    }
    
    try {
      // 1. Check per link Transfermarkt (più affidabile)
      if (transfermarktUrl) {
        const { data: allPlayers } = await supabase
          .from('players')
          .select('*');
        
        const existingByUrl = findPlayerByTransfermarktUrl(transfermarktUrl, allPlayers || []);
        if (existingByUrl) {
          setDuplicatePlayer(existingByUrl);
          toast.error(`⚠️ Link Transfermarkt già usato! ${createDuplicateMessage(existingByUrl)}`);
          return;
        }
      }
      
      // 2. Check per ID univoco (nome + nazionalità + anno)
      const newPlayer = {
        name: playerName.trim(),
        nationality: nationality || formData.nationality,
        birth_year: birthYear
      };
      
      const { data: allPlayers, error } = await supabase
        .from('players')
        .select('*');
      
      if (error) throw error;
      
      const duplicates = findDuplicatePlayers(newPlayer, allPlayers || []);
      
      if (duplicates.length > 0) {
        const duplicate = duplicates[0];
        setDuplicatePlayer(duplicate);
        console.log('🔍 Duplicato trovato:', duplicate);
      } else {
        setDuplicatePlayer(null);
      }
    } catch (error) {
      console.error('Errore controllo duplicati:', error);
      setDuplicatePlayer(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 handleSubmit chiamato');
    console.log('📋 formData:', formData);
    console.log('📊 showReportSection:', showReportSection);
    
    // Controllo duplicati prima di salvare (nome + nazionalità + anno di nascita)
    await checkDuplicatePlayer(formData.name, formData.birth_year, formData.nationality);
    
    // Se c'è un duplicato, non procedere
    if (duplicatePlayer) {
      console.warn('⚠️ Duplicato trovato, blocco submit');
      toast.error('❌ Impossibile aggiungere: giocatore già presente nel database');
      return; // L'avviso è già mostrato nel form
    }
    
    console.log('✅ Nessun duplicato, procedo con onSave');
    
    // Passa anche lo stato showReportSection per determinare se è una segnalazione
    onSave({
      ...formData,
      _hasReport: showReportSection // Flag interno per capire se il report è stato aperto
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gradient mb-2">➕ Add New Player</h2>
        <p className="text-gray-600">Fill the form or import data from Transfermarkt</p>
      </div>

      {/* Transfermarkt Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <i className="fas fa-globe text-white text-xl"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Import from Transfermarkt</h3>
            <p className="text-sm text-gray-600">Search and automatically import player data</p>
          </div>
        </div>
        
        {/* Direct input for Transfermarkt link */}
        <div className="flex gap-3">
          <input
            type="url"
            value={transfermarktUrl}
            onChange={(e) => setTransfermarktUrl(e.target.value)}
            placeholder="🔗 Paste the Transfermarkt link (e.g.: https://www.transfermarkt.com/...)"
            disabled={isLoadingTransfermarkt}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={handleImportFromTransfermarkt}
            disabled={isLoadingTransfermarkt || !transfermarktUrl.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isLoadingTransfermarkt ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Loading...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i>
                Import
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-xs text-yellow-800">
            <i className="fas fa-lightbulb mr-2"></i>
            <strong>💡 Tip:</strong> Data will be automatically filled in the form below
          </p>
        </div>
      </div>

      {/* Form Principale */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Basic Information Section */}
          <div className="col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
              <i className="fas fa-user text-purple-500"></i>
              Basic Information
            </h3>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value;
                setFormData({...formData, name: newName});
                // Check duplicates after 500ms of inactivity (name + birth year)
                clearTimeout(window.duplicateCheckTimeout);
                window.duplicateCheckTimeout = setTimeout(() => {
                  checkDuplicatePlayer(newName, formData.birth_year);
                }, 500);
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Mario Rossi"
            />
            
            {/* Duplicate Warning */}
            {duplicatePlayer && (
              <div className="mt-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 rounded-lg shadow-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-red-500 text-2xl mt-1"></i>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-800 mb-2 text-lg">⚠️ Duplicate Player Detected!</h4>
                    <p className="text-sm text-red-700 mb-3">
                      <strong>{duplicatePlayer.name}</strong> ({duplicatePlayer.birth_year}) is already in the database.
                      {transfermarktUrl && ' The Transfermarkt link has already been used.'}
                    </p>
                    <div className="bg-white rounded-lg p-3 mb-3 border border-red-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">📋 Existing player details:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Year:</strong> {duplicatePlayer.birth_year || 'N/A'}</p>
                        <p><strong>Nationality:</strong> {duplicatePlayer.nationality || 'N/A'}</p>
                        <p><strong>Team:</strong> {duplicatePlayer.team || 'N/A'}</p>
                        <p><strong>Role:</strong> {duplicatePlayer.general_role || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3 rounded">
                      <p className="text-sm text-blue-800">
                        <i className="fas fa-lightbulb mr-2"></i>
                        <strong>💡 Tip:</strong> Instead of adding a duplicate, fill out a <strong>scouting report</strong> for this player!
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Go to player page to add a report
                          toast.success('✅ Go to Database and search for the player to add a scouting report');
                          onCancel();
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-clipboard-list"></i>
                        📋 Fill Scouting Report
                      </button>
                      <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm font-semibold"
                      >
                        ← Go Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Birth Year
            </label>
            <input
              type="number"
              min="1990"
              max="2010"
              value={formData.birth_year}
              onChange={(e) => {
                const newBirthYear = parseInt(e.target.value);
                setFormData({...formData, birth_year: newBirthYear});
                // Check duplicates when birth year changes
                clearTimeout(window.duplicateCheckTimeout);
                window.duplicateCheckTimeout = setTimeout(() => {
                  checkDuplicatePlayer(formData.name, newBirthYear);
                }, 500);
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <small className="text-gray-500 text-xs mt-1 block">
              Age: {currentYear - formData.birth_year} years
            </small>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Club</label>
            <input
              type="text"
              value={formData.team}
              onChange={(e) => setFormData({...formData, team: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="AC Milan, Juventus..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => {
                const newNationality = e.target.value;
                setFormData({...formData, nationality: newNationality});
                
                // Check duplicates when nationality changes
                if (formData.name && formData.birth_year) {
                  clearTimeout(window.duplicateCheckTimeout);
                  window.duplicateCheckTimeout = setTimeout(() => {
                    checkDuplicatePlayer(formData.name, formData.birth_year, newNationality);
                  }, 500);
                }
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Italia, Francia..."
            />
          </div>

          {/* Physical Characteristics Section */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
              <i className="fas fa-ruler-vertical text-purple-500"></i>
              Physical Characteristics
            </h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
            <input
              type="text"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="180"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="text"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="75"
            />
          </div>

          {/* Role Section */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
              <i className="fas fa-futbol text-purple-500"></i>
              Role and Position
            </h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">General Role</label>
            <select
              value={formData.general_role}
              onChange={(e) => setFormData({...formData, general_role: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="Goalkeeper">🥅 Goalkeeper</option>
              <option value="Defender">🛡️ Defender</option>
              <option value="Terzino">↔️ Full-back</option>
              <option value="Centrocampo">⚽ Midfielder</option>
              <option value="Ala">🦅 Winger</option>
              <option value="Forward">🎯 Forward</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Specific Position</label>
            <input
              type="text"
              value={formData.specific_position}
              onChange={(e) => setFormData({...formData, specific_position: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Defensive midfielder, Right winger..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Foot</label>
            <select
              value={formData.preferred_foot}
              onChange={(e) => setFormData({...formData, preferred_foot: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="Right">👉 Right</option>
              <option value="Left">👈 Left</option>
              <option value="Both">👐 Both</option>
            </select>
          </div>

          {/* Economic Info Section */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
              <i className="fas fa-euro-sign text-purple-500"></i>
              Economic Information
            </h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Market Value</label>
            <input
              type="text"
              value={formData.market_value}
              onChange={(e) => setFormData({...formData, market_value: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="€2.5M, €500K..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contract Until</label>
            <input
              type="text"
              value={formData.contract_expiry}
              onChange={(e) => setFormData({...formData, contract_expiry: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="2026, June 2025..."
            />
          </div>

          {/* Reporter Name - Always visible */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👤 Reporter Name <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.signaler_name || ''}
              onChange={(e) => {
                const selectedName = e.target.value;
                setFormData({
                  ...formData, 
                  signaler_name: selectedName,
                  scout_name: selectedName // Automatically preselect as scout
                });
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Select reporter...</option>
              <option value="Alessio">Alessio</option>
              <option value="Roberto">Roberto</option>
            </select>
          </div>

          {/* Recommendation and Priority - Always visible */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🎯 Recommendation</label>
            <select
              value={formData.recommended_action}
              onChange={(e) => setFormData({...formData, recommended_action: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="Monitorare">Monitor</option>
              <option value="Valutare">Evaluate</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg cursor-pointer hover:bg-red-100 transition-all">
              <input
                type="checkbox"
                checked={formData.priority === 'Urgente'}
                onChange={(e) => setFormData({...formData, priority: e.target.checked ? 'Urgente' : null})}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <div className="flex-1">
                <span className="text-lg font-bold text-red-700">🚨 URGENT PRIORITY</span>
                <p className="text-sm text-red-600">Mark this player as urgent priority in reports</p>
              </div>
            </label>
          </div>

          {/* Scouting Report Section - Collapsible */}
          <div className="col-span-2 mt-4">
            <button
              type="button"
              onClick={() => setShowReportSection(!showReportSection)}
              className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4 hover:from-green-100 hover:to-blue-100 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <i className="fas fa-clipboard-check text-green-500 text-xl"></i>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      Scouting Report 
                      <span className="text-sm font-normal text-gray-600">(Optional)</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {showReportSection ? 'Click to hide' : 'Click to fill the report'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!showReportSection && (
                    <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">
                      Bookmark
                    </span>
                  )}
                  {showReportSection && (
                    <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">
                      Database
                    </span>
                  )}
                  <i className={`fas fa-chevron-${showReportSection ? 'up' : 'down'} text-gray-600 text-xl`}></i>
                </div>
              </div>
            </button>

            {showReportSection && (
              <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 animate-fadeIn">
                {/* Report Fields - Visible only when section is open */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📋 Scout Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.scout_name}
                      onChange={(e) => setFormData({...formData, scout_name: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select scout...</option>
                      <option value="Alessio">Alessio</option>
                      <option value="Roberto">Roberto</option>
                    </select>
                  </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Check Type <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.check_type}
              onChange={(e) => setFormData({...formData, check_type: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="Live">🔴 Live</option>
              <option value="Video">🎥 Video</option>
              <option value="Video/Live">🔴🎥 Video/Live</option>
              <option value="Dati">📊 Data</option>
            </select>
          </div>

          {/* Athletic Data Rating (visible only if check_type = 'Dati') */}
          {formData.check_type === 'Dati' ? (
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📊 Athletic Data Rating <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-4">
                <select
                  required
                  value={formData.athletic_data_rating}
                  onChange={(e) => setFormData({...formData, athletic_data_rating: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-2xl font-bold"
                >
                  <option value="🔴">🔴 Poor</option>
                  <option value="🟠">🟠 Insufficient</option>
                  <option value="🟡">🟡 Sufficient</option>
                  <option value="🟢">🟢 Good</option>
                  <option value="🏆">🏆 Top</option>
                </select>
              </div>
            </div>
          ) : (
            <>
              {/* Match Fields (visible only if check_type != 'Dati') */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Match</label>
                <input
                  type="text"
                  value={formData.match_name}
                  onChange={(e) => setFormData({...formData, match_name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="e.g.: Juve-Milan (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.match_date}
                  onChange={(e) => setFormData({...formData, match_date: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </>
          )}

          {/* Strengths and Weaknesses with Autocomplete */}
          <div className="col-span-2">
            <AttributeInput
              label="💪 Strengths"
              selectedAttributes={strengthAttributes}
              onAttributesChange={(attrs) => {
                setStrengthAttributes(attrs);
                setFormData({...formData, strong_points: attrs.join(', ')});
              }}
              suggestions={getAllStrengths()}
              placeholder="Write or select strengths..."
              required={true}
            />
          </div>

          <div className="col-span-2">
            <AttributeInput
              label="⚠️ Weaknesses"
              selectedAttributes={weaknessAttributes}
              onAttributesChange={(attrs) => {
                setWeaknessAttributes(attrs);
                setFormData({...formData, weak_points: attrs.join(', ')});
              }}
              suggestions={getAllWeaknesses()}
              placeholder="Write or select weaknesses..."
              required={true}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 General Notes <span className="text-red-500">*</span></label>
            <textarea
              required
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Additional notes about the player..."
            />
          </div>

          {/* Ratings Section - Inside Report */}
          <div className="col-span-2 mt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-purple-200 pb-2">
              <i className="fas fa-star text-purple-500"></i>
              Ratings
            </h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Value (1-5)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.current_value || 3}
                onChange={(e) => setFormData({...formData, current_value: parseInt(e.target.value)})}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg font-bold text-yellow-700 min-w-[80px] text-center">
                {formData.current_value || 3} ⭐
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Potential (1-5)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.potential_value || 3}
                onChange={(e) => setFormData({...formData, potential_value: parseInt(e.target.value)})}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="px-4 py-2 bg-green-100 border-2 border-green-400 rounded-lg font-bold text-green-700 min-w-[80px] text-center">
                {formData.potential_value || 3} ⭐
              </span>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">⭐ Final Rating <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.final_rating}
              onChange={(e) => setFormData({...formData, final_rating: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-2xl font-bold text-yellow-600"
            >
              <option value="A">A - Excellent</option>
              <option value="B">B - Good</option>
              <option value="C">C - Sufficient</option>
              <option value="D">D - Insufficient</option>
            </select>
          </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            ❌ Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-3 rounded-lg transition-all font-semibold shadow-lg ${
              showReportSection 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
            }`}
          >
            {showReportSection ? '➕ Add Player' : '📌 Bookmark Player'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlayerForm;
