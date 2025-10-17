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
    preferred_foot: 'Destro',
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

      const dbData = result.db_format;
      
      // Aggiorna solo i campi che hanno un valore valido dall'API
      // IMPORTANTE: Converti tutti i valori in stringhe per mantenere controlled inputs
      setFormData(prev => {
        const updatedData = { ...prev };
        
        if (dbData.name) updatedData.name = String(dbData.name);
        if (dbData.birth_year !== null && dbData.birth_year !== undefined) {
          updatedData.birth_year = String(dbData.birth_year);
        }
        if (dbData.birth_place) updatedData.birth_place = String(dbData.birth_place);
        if (dbData.team) updatedData.team = String(dbData.team);
        if (dbData.nationality) updatedData.nationality = String(dbData.nationality);
        if (dbData.height_cm) updatedData.height = String(dbData.height_cm);
        if (dbData.weight_kg) updatedData.weight = String(dbData.weight_kg);
        if (dbData.shirt_number) updatedData.shirt_number = String(dbData.shirt_number);
        if (dbData.general_role) updatedData.general_role = String(dbData.general_role);
        if (dbData.specific_position) updatedData.specific_position = String(dbData.specific_position);
        if (dbData.preferred_foot) updatedData.preferred_foot = String(dbData.preferred_foot);
        if (dbData.market_value) updatedData.market_value = String(dbData.market_value);
        if (dbData.contract_expiry) updatedData.contract_expiry = String(dbData.contract_expiry);
        if (dbData.transfermarkt_link) updatedData.transfermarkt_link = String(dbData.transfermarkt_link);
        if (dbData.profile_image) updatedData.profile_image = String(dbData.profile_image);
        if (dbData.natural_position) updatedData.natural_position = String(dbData.natural_position);
        if (dbData.other_positions) updatedData.other_positions = String(dbData.other_positions);
        if (dbData.market_value_updated) updatedData.market_value_updated = String(dbData.market_value_updated);
        if (dbData.notes) updatedData.notes = String(dbData.notes);
        
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
        <h2 className="text-2xl font-bold text-gradient mb-2">➕ Aggiungi Nuovo Giocatore</h2>
        <p className="text-gray-600">Compila il form o importa i dati da Transfermarkt</p>
      </div>

      {/* Sezione Transfermarkt */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <i className="fas fa-globe text-white text-xl"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Importa da Transfermarkt</h3>
            <p className="text-sm text-gray-600">Cerca e importa automaticamente i dati di un giocatore</p>
          </div>
        </div>
        
        {/* Input diretto per link Transfermarkt */}
        <div className="flex gap-3">
          <input
            type="url"
            value={transfermarktUrl}
            onChange={(e) => setTransfermarktUrl(e.target.value)}
            placeholder="🔗 Incolla il link Transfermarkt (es: https://www.transfermarkt.it/...)"
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
                Caricamento...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i>
                Importa
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-xs text-yellow-800">
            <i className="fas fa-lightbulb mr-2"></i>
            <strong>💡 Suggerimento:</strong> I dati verranno compilati automaticamente nel form sottostante
          </p>
        </div>
      </div>

      {/* Form Principale */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Sezione Informazioni Base */}
          <div className="col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
              <i className="fas fa-user text-purple-500"></i>
              Informazioni Base
            </h3>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value;
                setFormData({...formData, name: newName});
                // Controlla duplicati dopo 500ms di inattività (nome + anno nascita)
                clearTimeout(window.duplicateCheckTimeout);
                window.duplicateCheckTimeout = setTimeout(() => {
                  checkDuplicatePlayer(newName, formData.birth_year);
                }, 500);
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Mario Rossi"
            />
            
            {/* Avviso Duplicato */}
            {duplicatePlayer && (
              <div className="mt-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 rounded-lg shadow-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-red-500 text-2xl mt-1"></i>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-800 mb-2 text-lg">⚠️ Giocatore Duplicato Rilevato!</h4>
                    <p className="text-sm text-red-700 mb-3">
                      <strong>{duplicatePlayer.name}</strong> ({duplicatePlayer.birth_year}) è già presente nel database.
                      {transfermarktUrl && ' Il link Transfermarkt è già stato utilizzato.'}
                    </p>
                    <div className="bg-white rounded-lg p-3 mb-3 border border-red-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">📋 Dettagli giocatore esistente:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Anno:</strong> {duplicatePlayer.birth_year || 'N/D'}</p>
                        <p><strong>Nazionalità:</strong> {duplicatePlayer.nationality || 'N/D'}</p>
                        <p><strong>Squadra:</strong> {duplicatePlayer.team || 'N/D'}</p>
                        <p><strong>Ruolo:</strong> {duplicatePlayer.general_role || 'N/D'}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3 rounded">
                      <p className="text-sm text-blue-800">
                        <i className="fas fa-lightbulb mr-2"></i>
                        <strong>💡 Suggerimento:</strong> Invece di aggiungere un duplicato, compila un <strong>report di scouting</strong> per questo giocatore!
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Vai alla pagina del giocatore per aggiungere un report
                          toast.success('✅ Vai al Database e cerca il giocatore per aggiungere un report di scouting');
                          onCancel();
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-clipboard-list"></i>
                        📋 Compila Report Scouting
                      </button>
                      <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm font-semibold"
                      >
                        ← Torna Indietro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Anno di Nascita
            </label>
            <input
              type="number"
              min="1990"
              max="2010"
              value={formData.birth_year}
              onChange={(e) => {
                const newBirthYear = parseInt(e.target.value);
                setFormData({...formData, birth_year: newBirthYear});
                // Controlla duplicati quando cambia l'anno di nascita
                clearTimeout(window.duplicateCheckTimeout);
                window.duplicateCheckTimeout = setTimeout(() => {
                  checkDuplicatePlayer(formData.name, newBirthYear);
                }, 500);
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <small className="text-gray-500 text-xs mt-1 block">
              Età: {currentYear - formData.birth_year} anni
            </small>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Squadra</label>
            <input
              type="text"
              value={formData.team}
              onChange={(e) => setFormData({...formData, team: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="AC Milan, Juventus..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nazionalità</label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => {
                const newNationality = e.target.value;
                setFormData({...formData, nationality: newNationality});
                
                // Controlla duplicati quando cambia nazionalità
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

          {/* Sezione Caratteristiche Fisiche */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
              <i className="fas fa-ruler-vertical text-purple-500"></i>
              Caratteristiche Fisiche
            </h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Altezza (cm)</label>
            <input
              type="text"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="180"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Peso (kg)</label>
            <input
              type="text"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="75"
            />
          </div>

          {/* Sezione Ruolo */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
              <i className="fas fa-futbol text-purple-500"></i>
              Ruolo e Posizione
            </h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ruolo Generale</label>
            <select
              value={formData.general_role}
              onChange={(e) => setFormData({...formData, general_role: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="Portiere">🥅 Portiere</option>
              <option value="Difensore">🛡️ Difensore</option>
              <option value="Terzino">↔️ Terzino</option>
              <option value="Centrocampo">⚽ Centrocampo</option>
              <option value="Ala">🦅 Ala</option>
              <option value="Attaccante">🎯 Attaccante</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Posizione Specifica</label>
            <input
              type="text"
              value={formData.specific_position}
              onChange={(e) => setFormData({...formData, specific_position: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Mediano, Ala destra..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Piede Preferito</label>
            <select
              value={formData.preferred_foot}
              onChange={(e) => setFormData({...formData, preferred_foot: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="Destro">👉 Destro</option>
              <option value="Sinistro">👈 Sinistro</option>
              <option value="Ambidestro">👐 Ambidestro</option>
            </select>
          </div>

          {/* Sezione Info Economiche */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-purple-200 pb-2">
              <i className="fas fa-euro-sign text-purple-500"></i>
              Informazioni Economiche
            </h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Valore di Mercato</label>
            <input
              type="text"
              value={formData.market_value}
              onChange={(e) => setFormData({...formData, market_value: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="€2.5M, €500K..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contratto fino al</label>
            <input
              type="text"
              value={formData.contract_expiry}
              onChange={(e) => setFormData({...formData, contract_expiry: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="2026, Giugno 2025..."
            />
          </div>

          {/* Nome Segnalatore - Sempre visibile */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👤 Nome Segnalatore <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.signaler_name || ''}
              onChange={(e) => {
                const selectedName = e.target.value;
                setFormData({
                  ...formData, 
                  signaler_name: selectedName,
                  scout_name: selectedName // Preseleziona automaticamente come scout
                });
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Seleziona segnalatore...</option>
              <option value="Alessio">Alessio</option>
              <option value="Roberto">Roberto</option>
            </select>
          </div>

          {/* Raccomandazione e Priorità - Sempre visibili */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🎯 Raccomandazione</label>
            <select
              value={formData.recommended_action}
              onChange={(e) => setFormData({...formData, recommended_action: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="Monitorare">Monitorare</option>
              <option value="Valutare">Valutare</option>
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
                <span className="text-lg font-bold text-red-700">🚨 PRIORITÀ URGENTE</span>
                <p className="text-sm text-red-600">Segna questo giocatore come priorità urgente nelle segnalazioni</p>
              </div>
            </label>
          </div>

          {/* Sezione Report Scouting - Collassabile */}
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
                      Report Scouting 
                      <span className="text-sm font-normal text-gray-600">(Opzionale)</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {showReportSection ? 'Clicca per nascondere' : 'Clicca per compilare il report'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!showReportSection && (
                    <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">
                      Segnalazione
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
                {/* Campi Report - Visibili solo quando la sezione è aperta */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📋 Nome Scout <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.scout_name}
                      onChange={(e) => setFormData({...formData, scout_name: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="">Seleziona scout...</option>
                      <option value="Alessio">Alessio</option>
                      <option value="Roberto">Roberto</option>
                    </select>
                  </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo di Check <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.check_type}
              onChange={(e) => setFormData({...formData, check_type: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="Live">🔴 Live</option>
              <option value="Video">🎥 Video</option>
              <option value="Video/Live">🔴🎥 Video/Live</option>
              <option value="Dati">📊 Dati</option>
            </select>
          </div>

          {/* Valutazione Dati Atletici (visibile solo se check_type = 'Dati') */}
          {formData.check_type === 'Dati' ? (
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📊 Valutazione Dati Atletici <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-4">
                <select
                  required
                  value={formData.athletic_data_rating}
                  onChange={(e) => setFormData({...formData, athletic_data_rating: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-2xl font-bold"
                >
                  <option value="🔴">🔴 Scarso</option>
                  <option value="🟠">🟠 Insufficiente</option>
                  <option value="🟡">🟡 Sufficiente</option>
                  <option value="🟢">🟢 Buono</option>
                  <option value="🏆">🏆 Top</option>
                </select>
              </div>
            </div>
          ) : (
            <>
              {/* Campi Partita (visibili solo se check_type != 'Dati') */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Partita</label>
                <input
                  type="text"
                  value={formData.match_name}
                  onChange={(e) => setFormData({...formData, match_name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="es: Juve-Milan (opzionale)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={formData.match_date}
                  onChange={(e) => setFormData({...formData, match_date: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </>
          )}

          {/* Punti di Forza e Debolezza con Autocomplete */}
          <div className="col-span-2">
            <AttributeInput
              label="💪 Punti di Forza"
              selectedAttributes={strengthAttributes}
              onAttributesChange={(attrs) => {
                setStrengthAttributes(attrs);
                setFormData({...formData, strong_points: attrs.join(', ')});
              }}
              suggestions={getAllStrengths()}
              placeholder="Scrivi o seleziona punti di forza..."
              required={true}
            />
          </div>

          <div className="col-span-2">
            <AttributeInput
              label="⚠️ Punti Deboli"
              selectedAttributes={weaknessAttributes}
              onAttributesChange={(attrs) => {
                setWeaknessAttributes(attrs);
                setFormData({...formData, weak_points: attrs.join(', ')});
              }}
              suggestions={getAllWeaknesses()}
              placeholder="Scrivi o seleziona punti deboli..."
              required={true}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Note Generali <span className="text-red-500">*</span></label>
            <textarea
              required
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Note aggiuntive sul giocatore..."
            />
          </div>

          {/* Sezione Valutazioni - Dentro Report */}
          <div className="col-span-2 mt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 border-b border-purple-200 pb-2">
              <i className="fas fa-star text-purple-500"></i>
              Valutazioni
            </h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Valore Attuale (1-5)</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Potenziale (1-5)</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">⭐ Valutazione Finale <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.final_rating}
              onChange={(e) => setFormData({...formData, final_rating: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-2xl font-bold text-yellow-600"
            >
              <option value="A">A - Eccellente</option>
              <option value="B">B - Buono</option>
              <option value="C">C - Sufficiente</option>
              <option value="D">D - Insufficiente</option>
            </select>
          </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Azioni Form */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            ❌ Annulla
          </button>
          <button
            type="submit"
            className={`px-6 py-3 rounded-lg transition-all font-semibold shadow-lg ${
              showReportSection 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
            }`}
          >
            {showReportSection ? '➕ Aggiungi Giocatore' : '📌 Segnala Giocatore'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlayerForm;
