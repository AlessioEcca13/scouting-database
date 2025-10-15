<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
=======
// App.js - VERSIONE COMPLETA CON DATABASE SUPABASE + INTEGRAZIONE TRANSFERMARKT
// 
// ISTRUZIONI SETUP:
// 1. Crea progetto: npx create-react-app scouting-app
// 2. Installa: npm install @supabase/supabase-js react-hot-toast
// 3. Crea account su supabase.com e ottieni credenziali
// 4. Sostituisci SUPABASE_URL e SUPABASE_KEY nel file .env
// 5. Crea il file src/components/PlayerSearchTransfermarkt.js
// 6. Crea tabella 'players' in Supabase con schema fornito

import React, { useState, useEffect, useCallback } from 'react';
>>>>>>> dff6e6a9 (feat: campo tattico completo con 12 moduli, colori e anti-duplicati)
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import PlayerSearchTransfermarkt from './components/PlayerSearchTransfermarkt';
import { supabase } from './services/supabase';

<<<<<<< HEAD
// Inizializza client Supabase
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Credenziali Supabase mancanti!');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

=======
// ⚠️ CREDENZIALI DA FILE .env
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

>>>>>>> dff6e6a9 (feat: campo tattico completo con 12 moduli, colori e anti-duplicati)
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // cards, table, compact
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Funzione per caricare giocatori dal database
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('players')
        .select('*')
        .order('name', { ascending: true });

      // Applica filtri se presenti
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,team.ilike.%${searchTerm}%`);
      }
      
      if (filterRole) {
        query = query.eq('general_role', filterRole);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setPlayers(data || []);
      toast.success(`Caricati ${data?.length || 0} giocatori`);
      
    } catch (error) {
      console.error('Errore caricamento:', error);
      toast.error('Errore nel caricamento dei giocatori');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRole]);

  // Carica giocatori all'avvio
  useEffect(() => {
    fetchPlayers();
    
    // Setup subscription per aggiornamenti real-time
    const subscription = supabase
      .channel('players_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players' },
        (payload) => {
          console.log('Cambiamento rilevato:', payload);
          fetchPlayers(); // Ricarica quando ci sono modifiche
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPlayers]);



<<<<<<< HEAD
=======
      setPlayers([...players, data]);
      toast.success('✅ Giocatore aggiunto con successo!');
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Errore inserimento:', error);
      toast.error(`❌ Errore nell'aggiunta del giocatore: ${error.message}`);
    }
  }

  // Aggiorna giocatore esistente
  async function updatePlayer(id, updates) {
    try {
      const { data, error } = await supabase
        .from('players')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Aggiorna stato locale
      setPlayers(players.map(p => p.id === id ? data : p));
      toast.success('✅ Giocatore aggiornato!');
      
    } catch (error) {
      console.error('Errore aggiornamento:', error);
      toast.error(`❌ Errore nell'aggiornamento: ${error.message}`);
    }
  }

  // Elimina giocatore
  async function deletePlayer(id) {
    if (!window.confirm('Sei sicuro di voler eliminare questo giocatore?')) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlayers(players.filter(p => p.id !== id));
      toast.success('🗑️ Giocatore eliminato');
      setSelectedPlayer(null);
      
    } catch (error) {
      console.error('Errore eliminazione:', error);
      toast.error('❌ Errore nell\'eliminazione');
    }
  }
>>>>>>> dff6e6a9 (feat: campo tattico completo con 12 moduli, colori e anti-duplicati)

  // ========================================
  // COMPONENTE FORM GIOCATORE CON INTEGRAZIONE TRANSFERMARKT
  // ========================================
  function PlayerForm({ player, onSave, onClose }) {
    const [transfermarktUrl, setTransfermarktUrl] = useState('');
    const [isLoadingTransfermarkt, setIsLoadingTransfermarkt] = useState(false);
    const [formData, setFormData] = useState(player || {
      name: '',
      birth_year: 2000,
      team: '',
      nationality: '',
      height: '',
      weight: '',
      general_role: 'Centrocampo',
      specific_position: '',
      functions_labels: '',
      preferred_foot: 'Destro',
      athleticism: '',
      athletic_evaluation: null,
      key_characteristics: '',
      potential_value: 3,
      current_value: 2,
      data_potential_value: 3,
      market_value: '',
      contract_expiry: '',
      transfermarkt_link: '',
      notes: '',
      priority: 'Media',
      recommended_action: 'Monitorare',
      director_feedback: 'Da valutare',
      check_type: 'Live/Video',
      outcome: '',
      scout_name: '',
      scouting_date: new Date().toISOString().split('T')[0],
      injuries: '',
      strong_points: '',
      weak_points: '',
      comparison: ''
    });

    // ✅ FUNZIONE PER GESTIRE L'IMPORTAZIONE DA TRANSFERMARKT
    const handleImportFromTransfermarkt = async () => {
      if (!transfermarktUrl.trim()) {
        toast.error('Inserisci un URL Transfermarkt valido');
        return;
      }

      if (!transfermarktUrl.includes('transfermarkt')) {
        toast.error('L\'URL deve essere di Transfermarkt');
        return;
      }

      setIsLoadingTransfermarkt(true);
      
      try {
        // Chiama l'API Flask locale
        const response = await fetch('http://localhost:5001/api/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: transfermarktUrl })
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Errore durante l\'importazione');
        }

        // Estrai i dati nel formato database
        const dbData = result.db_format;
        
        // Auto-compila il form con i dati estratti
        setFormData(prev => ({
          ...prev,
          name: dbData.name || prev.name,
          birth_year: dbData.birth_year || prev.birth_year,
          team: dbData.team || prev.team,
          nationality: dbData.nationality || prev.nationality,
          height: dbData.height_cm || prev.height,
          general_role: dbData.general_role || prev.general_role,
          specific_position: dbData.specific_position || prev.specific_position,
          preferred_foot: dbData.preferred_foot || prev.preferred_foot,
          market_value: dbData.market_value || prev.market_value,
          contract_expiry: dbData.contract_expiry || prev.contract_expiry,
          transfermarkt_link: dbData.transfermarkt_link || transfermarktUrl,
          notes: dbData.notes || prev.notes
        }));

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

    const handleSubmit = (e) => {
      e.preventDefault();
      if (player?.id) {
        updatePlayer(player.id, formData);
      } else {
        onSave(formData);
      }
      onClose();
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
          <button className="close-btn" onClick={onClose}>×</button>
          
          <h2 className="text-2xl font-bold mb-4 text-blue-600">
            {player ? '✏️ Modifica Giocatore' : '➕ Nuovo Giocatore'}
          </h2>
          
          {/* ========================================
              SEZIONE IMPORTAZIONE DA TRANSFERMARKT
              ======================================== */}
          {!player && (
            <div className="transfermarkt-section">
              <div className="transfermarkt-header">
                <div className="transfermarkt-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <div className="transfermarkt-title">
                  <h3>Importa da Transfermarkt</h3>
                  <p>Cerca e importa automaticamente i dati di un giocatore</p>
                </div>
              </div>
              
              {/* Input diretto per link Transfermarkt */}
              <div style={{marginTop: '16px'}}>
                <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
                  <div style={{flex: 1}}>
                    <input
                      type="url"
                      value={transfermarktUrl}
                      onChange={(e) => setTransfermarktUrl(e.target.value)}
                      placeholder="🔗 Incolla il link Transfermarkt (es: https://www.transfermarkt.it/...)"
                      disabled={isLoadingTransfermarkt}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '0.95rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'all 0.2s',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleImportFromTransfermarkt}
                    disabled={isLoadingTransfermarkt || !transfermarktUrl.trim()}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: isLoadingTransfermarkt || !transfermarktUrl.trim() ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: isLoadingTransfermarkt || !transfermarktUrl.trim() ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      opacity: isLoadingTransfermarkt || !transfermarktUrl.trim() ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoadingTransfermarkt && transfermarktUrl.trim()) {
                        e.target.style.backgroundColor = '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoadingTransfermarkt && transfermarktUrl.trim()) {
                        e.target.style.backgroundColor = '#3b82f6';
                      }
                    }}
                  >
                    {isLoadingTransfermarkt ? (
                      <span>
                        <i className="fas fa-spinner fa-spin" style={{marginRight: '8px'}}></i>
                        Caricamento...
                      </span>
                    ) : (
                      <span>
                        <i className="fas fa-download" style={{marginRight: '8px'}}></i>
                        Importa
                      </span>
                    )}
                  </button>
                </div>
              </div>
              
              <div style={{marginTop: '12px', padding: '12px', backgroundColor: '#fef9c3', borderRadius: '8px', border: '1px solid #fde047'}}>
                <p style={{fontSize: '0.85rem', color: '#854d0e', margin: '0'}}>
                  <i className="fas fa-info-circle" style={{marginRight: '6px'}}></i>
                  <strong>💡 Suggerimento:</strong> I dati verranno compilati automaticamente nel form sottostante
                </p>
              </div>
              
              <div className="transfermarkt-info" style={{marginTop: '12px'}}>
                <p style={{fontSize: '0.85rem', color: '#6b7280', margin: '0'}}>
                  <i className="fas fa-lightbulb" style={{marginRight: '6px'}}></i>
                  Incolla il link del profilo Transfermarkt per compilare automaticamente: 
                  nome, squadra, nazionalità, ruolo, altezza, piede e valore di mercato.
                </p>
              </div>
            </div>
          )}

          {/* ========================================
              FORM PRINCIPALE
              ======================================== */}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Sezione Informazioni Base */}
              <div className="form-section-title">
                <i className="fas fa-user"></i>
                Informazioni Base
              </div>
              
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Mario Rossi"
                />
              </div>

              <div className="form-group">
                <label>Anno di Nascita</label>
                <input
                  type="number"
                  min="1990"
                  max="2010"
                  value={formData.birth_year}
                  onChange={(e) => setFormData({...formData, birth_year: parseInt(e.target.value)})}
                />
                <small className="text-gray-500">
                  {formData.birth_year && `Età: ${new Date().getFullYear() - formData.birth_year} anni`}
                </small>
              </div>

              <div className="form-group">
                <label>Squadra</label>
                <input
                  type="text"
                  value={formData.team}
                  onChange={(e) => setFormData({...formData, team: e.target.value})}
                  placeholder="AC Milan, Juventus..."
                />
              </div>

              <div className="form-group">
                <label>Nazionalità</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  placeholder="Italia, Francia..."
                />
              </div>

              {/* Sezione Caratteristiche Fisiche */}
              <div className="form-section-title">
                <i className="fas fa-ruler-vertical"></i>
                Caratteristiche Fisiche
              </div>
              
              <div className="form-group">
                <label>Altezza (cm)</label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  placeholder="180"
                />
              </div>

              <div className="form-group">
                <label>Peso (kg)</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="75"
                />
              </div>

              {/* Sezione Ruolo e Posizione */}
              <div className="form-section-title">
                <i className="fas fa-futbol"></i>
                Ruolo e Posizione
              </div>
              
              <div className="form-group">
                <label>Ruolo Generale</label>
                <select
                  value={formData.general_role}
                  onChange={(e) => setFormData({...formData, general_role: e.target.value})}
                >
                  <option value="Portiere">🥅 Portiere</option>
                  <option value="Difensore">🛡️ Difensore</option>
                  <option value="Terzino">↔️ Terzino</option>
                  <option value="Centrocampo">⚽ Centrocampo</option>
                  <option value="Ala">🦅 Ala</option>
                  <option value="Attaccante">🎯 Attaccante</option>
                </select>
              </div>

              <div className="form-group">
                <label>Posizione Specifica</label>
                <input
                  type="text"
                  value={formData.specific_position}
                  onChange={(e) => setFormData({...formData, specific_position: e.target.value})}
                  placeholder="Mediano, Ala destra..."
                />
              </div>

              <div className="form-group">
                <label>Piede Preferito</label>
                <select
                  value={formData.preferred_foot}
                  onChange={(e) => setFormData({...formData, preferred_foot: e.target.value})}
                >
                  <option value="Destro">👉 Destro</option>
                  <option value="Sinistro">👈 Sinistro</option>
                  <option value="Ambidestro">👐 Ambidestro</option>
                </select>
              </div>

              {/* Sezione Valutazioni */}
              <div className="form-section-title">
                <i className="fas fa-star"></i>
                Valutazioni
              </div>
              
              <div className="form-group">
                <label>Valore Attuale (1-5)</label>
                <div className="rating-container">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.current_value}
                    onChange={(e) => setFormData({...formData, current_value: parseInt(e.target.value)})}
                    style={{flex: 1}}
                  />
                  <span className="rating-label" style={{color: '#f59e0b'}}>
                    {formData.current_value} ⭐
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Potenziale (1-5)</label>
                <div className="rating-container">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.potential_value}
                    onChange={(e) => setFormData({...formData, potential_value: parseInt(e.target.value)})}
                    style={{flex: 1}}
                  />
                  <span className="rating-label" style={{color: '#10b981'}}>
                    {formData.potential_value} ⭐
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Potenziale Dati (1-5)</label>
                <div className="rating-container">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.data_potential_value}
                    onChange={(e) => setFormData({...formData, data_potential_value: parseInt(e.target.value)})}
                    style={{flex: 1}}
                  />
                  <span className="rating-label" style={{color: '#8b5cf6'}}>
                    {formData.data_potential_value} ⭐
                  </span>
                </div>
              </div>

              {/* Sezione Info Economiche */}
              <div className="form-section-title">
                <i className="fas fa-euro-sign"></i>
                Informazioni Economiche
              </div>
              
              <div className="form-group">
                <label>Valore di Mercato</label>
                <input
                  type="text"
                  value={formData.market_value}
                  onChange={(e) => setFormData({...formData, market_value: e.target.value})}
                  placeholder="€2.5M, €500K..."
                />
              </div>

              <div className="form-group">
                <label>Contratto fino al</label>
                <input
                  type="text"
                  value={formData.contract_expiry}
                  onChange={(e) => setFormData({...formData, contract_expiry: e.target.value})}
                  placeholder="2026, Giugno 2025..."
                />
              </div>

              {/* Sezione Priorità e Azioni */}
              <div className="form-section-title">
                <i className="fas fa-tasks"></i>
                Priorità e Azioni Raccomandate
              </div>
              
              <div className="form-group">
                <label>Priorità</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="Alta">🔴 Alta</option>
                  <option value="Media">🟡 Media</option>
                  <option value="Bassa">🟢 Bassa</option>
                </select>
              </div>

              <div className="form-group">
                <label>Azione Raccomandata</label>
                <select
                  value={formData.recommended_action}
                  onChange={(e) => setFormData({...formData, recommended_action: e.target.value})}
                >
                  <option value="Monitorare">👀 Monitorare</option>
                  <option value="Approfondire">🔍 Approfondire</option>
                  <option value="Contattare">📞 Contattare</option>
                  <option value="Scartare">❌ Scartare</option>
                </select>
              </div>

              <div className="form-group">
                <label>Feedback Direttore</label>
                <select
                  value={formData.director_feedback}
                  onChange={(e) => setFormData({...formData, director_feedback: e.target.value})}
                >
                  <option value="Mi piace">👍 Mi piace</option>
                  <option value="Da valutare">🤔 Da valutare</option>
                  <option value="Non mi convince">👎 Non mi convince</option>
                  <option value="Interessante">⭐ Interessante</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tipo di Check</label>
                <select
                  value={formData.check_type}
                  onChange={(e) => setFormData({...formData, check_type: e.target.value})}
                >
                  <option value="Live">🔴 Live</option>
                  <option value="Video">📹 Video</option>
                  <option value="Live/Video">🔴📹 Live/Video</option>
                  <option value="Dati">📊 Dati</option>
                </select>
              </div>

              {/* Link Transfermarkt */}
              {formData.transfermarkt_link && (
                <div className="form-group full-width">
                  <label>Link Transfermarkt</label>
                  <input
                    type="text"
                    value={formData.transfermarkt_link}
                    onChange={(e) => setFormData({...formData, transfermarkt_link: e.target.value})}
                    className="bg-gray-50"
                    readOnly
                  />
                  <a 
                    href={formData.transfermarkt_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    🔗 Apri su Transfermarkt
                  </a>
                </div>
              )}

              {/* Sezione Caratteristiche */}
              <div className="form-section-title">
                <i className="fas fa-clipboard-list"></i>
                Caratteristiche e Note
              </div>
              
              <div className="form-group full-width">
                <label>Punti di Forza</label>
                <textarea
                  rows="2"
                  value={formData.strong_points}
                  onChange={(e) => setFormData({...formData, strong_points: e.target.value})}
                  placeholder="Visione di gioco, tiro da fuori, inserimenti..."
                />
              </div>

              <div className="form-group full-width">
                <label>Punti Deboli</label>
                <textarea
                  rows="2"
                  value={formData.weak_points}
                  onChange={(e) => setFormData({...formData, weak_points: e.target.value})}
                  placeholder="Velocità, contrasti aerei, marcatura..."
                />
              </div>

              {/* Note Scout */}
              <div className="form-group full-width">
                <label>Note Scout</label>
                <textarea
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Report dettagliato: stile di gioco, caratteristiche principali, potenziale di crescita..."
                />
              </div>
            </div>

            {/* Azioni Form */}
            <div className="form-actions" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                ❌ Annulla
              </button>
              <button type="submit" className="btn-primary">
                {player ? '💾 Salva Modifiche' : '➕ Aggiungi Giocatore'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Componente Card Giocatore
  function PlayerCard({ player }) {
    return (
      <div className="player-card" onClick={() => setSelectedPlayer(player)}>
        <div className="player-header">
          <h3>{player.name}</h3>
          <span className="player-year">{player.birth_year}</span>
        </div>
        <div className="player-info">
          <p>🏆 {player.team || 'N/A'}</p>
          <p>⚽ {player.general_role}</p>
          <p>👟 {player.preferred_foot}</p>
          {player.market_value && <p>💰 {player.market_value}</p>}
        </div>
        <div className="player-ratings">
          <div>Attuale: {'⭐'.repeat(player.current_value || 0)}</div>
          <div>Potenziale: {'⭐'.repeat(player.potential_value || 0)}</div>
        </div>
        <div className="player-actions">
          <button onClick={(e) => {
            e.stopPropagation();
            setShowAddForm(player);
          }}>✏️</button>
          <button onClick={(e) => {
            e.stopPropagation();
            deletePlayer(player.id);
          }}>🗑️</button>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  // Sistema di notifiche
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Aggiungi giocatore
  const addPlayer = async (playerData) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{
          ...playerData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setPlayers([...players, data]);
      showNotification('✅ Giocatore aggiunto con successo!', 'success');
      setCurrentPage('database');
      
    } catch (error) {
      console.error('Errore inserimento:', error);
      showNotification(`❌ Errore nell'aggiunta: ${error.message}`, 'error');
    }
  };
=======
  // Rendering principale
  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{
        success: {
          style: {
            background: '#10b981',
            color: 'white',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: 'white',
          },
        },
      }} />
      
      {/* Header */}
      <header className="app-header">
        <h1>⚽ Scouting Database Pro</h1>
        <p>Sistema Professionale con Supabase + Transfermarkt API</p>
      </header>
>>>>>>> dff6e6a9 (feat: campo tattico completo con 12 moduli, colori e anti-duplicati)

  // Modifica giocatore
  const updatePlayer = async (id, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPlayers(players.map(p => p.id === id ? data : p));
      showNotification('✅ Giocatore aggiornato!', 'success');
      
    } catch (error) {
      console.error('Errore aggiornamento:', error);
      showNotification(`❌ Errore nell'aggiornamento: ${error.message}`, 'error');
    }
  };

  // Elimina giocatore
  const deletePlayer = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo giocatore?')) {
      try {
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setPlayers(players.filter(p => p.id !== id));
        showNotification('🗑️ Giocatore eliminato', 'info');
        setSelectedPlayer(null);
        
      } catch (error) {
        console.error('Errore eliminazione:', error);
        showNotification('❌ Errore nell\'eliminazione', 'error');
      }
    }
  };

  // Componente Navigation
  function Navigation() {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
      { id: 'database', label: 'Database', icon: 'fa-database' },
      { id: 'add', label: 'Aggiungi Giocatore', icon: 'fa-plus-circle' },
      { id: 'reports', label: 'Report', icon: 'fa-chart-bar' }
    ];

    return (
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <i className="fas fa-futbol text-2xl text-blue-600"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Scouting System</h1>
                <p className="text-xs text-blue-100">Database Professionale</p>
              </div>
            </div>
            
            <div className="flex space-x-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm font-medium
                    ${currentPage === item.id 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'}`}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              ))}
            </div>

<<<<<<< HEAD
            <div className="flex items-center space-x-3">
              <span className="text-sm text-blue-100">
                {players.length} giocatori
              </span>
              <button className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors">
                <i className="fas fa-user text-white"></i>
=======
      {/* Stato Database */}
      <div className="db-status">
        {!SUPABASE_URL || SUPABASE_URL.includes('tuoprogetto') ? (
          <div className="warning">
            ⚠️ Database non configurato! Aggiungi le credenziali nel file .env
          </div>
        ) : (
          <div className="success">
            ✅ Connesso a Supabase Database | 🌐 Transfermarkt API Attiva
          </div>
        )}
      </div>

      {/* Lista Giocatori */}
      {loading ? (
        <div className="loading">
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <p>Caricamento giocatori...</p>
        </div>
      ) : (
        <div className="players-grid">
          {players.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-users" style={{ fontSize: '4rem', color: '#ccc', marginBottom: '1rem' }}></i>
              <p>Nessun giocatore trovato</p>
              <button onClick={() => setShowAddForm(true)}>
                Aggiungi il primo giocatore
>>>>>>> dff6e6a9 (feat: campo tattico completo con 12 moduli, colori e anti-duplicati)
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Componente Dashboard
  function Dashboard() {
    const stats = {
      totalPlayers: players.length,
      avgPotential: players.length > 0 ? (players.reduce((acc, p) => acc + (p.potential_value || 0), 0) / players.length).toFixed(1) : 0,
      highPotential: players.filter(p => (p.potential_value || 0) >= 4).length,
      positions: {
        'Portiere': players.filter(p => p.general_role === 'Portiere').length,
        'Difensore': players.filter(p => p.general_role === 'Difensore').length,
        'Centrocampo': players.filter(p => p.general_role === 'Centrocampo').length,
        'Attaccante': players.filter(p => p.general_role === 'Attaccante').length
      }
    };

    const recentPlayers = [...players].sort((a, b) => 
      new Date(b.created_at || 0) - new Date(a.created_at || 0)
    ).slice(0, 3);

    return (
      <div className="fade-in space-y-6 max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Dashboard Overview</h2>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform shadow-lg">
              <i className="fas fa-users text-4xl mb-3 opacity-90"></i>
              <div className="text-4xl font-bold mb-1">{stats.totalPlayers}</div>
              <div className="text-sm opacity-90 font-medium">Totale Giocatori</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform shadow-lg">
              <i className="fas fa-star text-4xl mb-3 opacity-90"></i>
              <div className="text-4xl font-bold mb-1">{stats.avgPotential}</div>
              <div className="text-sm opacity-90 font-medium">Media Potenziale</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform shadow-lg">
              <i className="fas fa-gem text-4xl mb-3 opacity-90"></i>
              <div className="text-4xl font-bold mb-1">{stats.highPotential}</div>
              <div className="text-sm opacity-90 font-medium">Alto Potenziale (4+)</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform shadow-lg">
              <i className="fas fa-chart-line text-4xl mb-3 opacity-90"></i>
              <div className="text-4xl font-bold mb-1">{recentPlayers.length}</div>
              <div className="text-sm opacity-90 font-medium">Aggiunti Recente</div>
            </div>
          </div>

          {/* Distribuzione Ruoli */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Distribuzione per Ruolo</h3>
            <div className="space-y-4">
              {Object.entries(stats.positions).map(([role, count]) => (
                <div key={role} className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-700">{role}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden mx-4">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                      style={{width: players.length > 0 ? `${Math.max((count / players.length) * 100, 5)}%` : '0%'}}
                    >
                      {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Players */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Ultimi Giocatori Aggiunti</h3>
            {recentPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentPlayers.map(player => (
                  <div key={player.id} className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
                       onClick={() => {
                         setSelectedPlayer(player);
                         setCurrentPage('database');
                       }}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{player.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {player.general_role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{player.team}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-yellow-500 text-sm">
                        {'★'.repeat(player.potential_value || 0)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(player.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessun giocatore nel database</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rendering principale
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'database' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Controlli Database */}
            <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-600">Database Giocatori</h2>
                <div className="flex items-center space-x-3">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-2 rounded transition-colors ${
                        viewMode === 'cards' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      <i className="fas fa-th-large"></i>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-2 rounded transition-colors ${
                        viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      <i className="fas fa-table"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Cerca nome, squadra..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">Tutti i ruoli</option>
                  <option value="Portiere">Portiere</option>
                  <option value="Difensore">Difensore</option>
                  <option value="Centrocampo">Centrocampo</option>
                  <option value="Attaccante">Attaccante</option>
                </select>
                <button
                  onClick={fetchPlayers}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <i className="fas fa-sync mr-2"></i>
                  Aggiorna
                </button>
                <button
                  onClick={() => setCurrentPage('add')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Nuovo
                </button>
              </div>
            </div>
            {/* Lista Giocatori */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                  <p className="text-gray-600">Caricamento giocatori...</p>
                </div>
              </div>
            ) : (
              <div className="players-grid">
                {players.length === 0 ? (
                  <div className="empty-state">
                    <p>Nessun giocatore trovato</p>
                    <button onClick={() => setCurrentPage('add')}>
                      Aggiungi il primo giocatore
                    </button>
                  </div>
                ) : (
                  players.map(player => (
                    <PlayerCard key={player.id} player={player} />
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {currentPage === 'add' && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <AddPlayerForm 
              addPlayer={addPlayer}
              showNotification={showNotification}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </main>

      {/* Modal Form */}
      {showAddForm && (
        <PlayerForm
          player={typeof showAddForm === 'object' ? showAddForm : null}
          onSave={addPlayer}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Modal Dettaglio */}
      {selectedPlayer && (
        <div className="modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="modal-content detail" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPlayer(null)}>×</button>
            <h2>{selectedPlayer.name}</h2>
            
            <div className="detail-grid">
              <div><strong>Anno:</strong> {selectedPlayer.birth_year}</div>
              <div><strong>Squadra:</strong> {selectedPlayer.team}</div>
              <div><strong>Ruolo:</strong> {selectedPlayer.general_role}</div>
              <div><strong>Piede:</strong> {selectedPlayer.preferred_foot}</div>
<<<<<<< HEAD
              <div><strong>Posizione:</strong> {selectedPlayer.specific_position}</div>
=======
              {selectedPlayer.height && <div><strong>Altezza:</strong> {selectedPlayer.height}</div>}
              {selectedPlayer.market_value && <div><strong>Valore:</strong> {selectedPlayer.market_value}</div>}
              {selectedPlayer.priority && <div><strong>Priorità:</strong> {selectedPlayer.priority}</div>}
              <div><strong>Check:</strong> {selectedPlayer.check_type}</div>
>>>>>>> dff6e6a9 (feat: campo tattico completo con 12 moduli, colori e anti-duplicati)
            </div>

            {selectedPlayer.strong_points && (
              <div className="notes-section" style={{ background: '#d1fae5', borderLeft: '4px solid #10b981' }}>
                <h3>✅ Punti di Forza:</h3>
                <p>{selectedPlayer.strong_points}</p>
              </div>
            )}

            {selectedPlayer.weak_points && (
              <div className="notes-section" style={{ background: '#fee2e2', borderLeft: '4px solid #ef4444' }}>
                <h3>❌ Punti Deboli:</h3>
                <p>{selectedPlayer.weak_points}</p>
              </div>
            )}

            {selectedPlayer.notes && (
              <div className="notes-section">
                <h3>📝 Note Scout:</h3>
                <p>{selectedPlayer.notes}</p>
              </div>
            )}

            {selectedPlayer.transfermarkt_link && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <a 
                  href={selectedPlayer.transfermarkt_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ display: 'inline-block', textDecoration: 'none' }}
                >
                  🔗 Vedi su Transfermarkt
                </a>
              </div>
            )}

            <div className="detail-actions">
              <button onClick={() => {
                setShowAddForm(selectedPlayer);
                setSelectedPlayer(null);
              }}>✏️ Modifica</button>
              <button onClick={() => deletePlayer(selectedPlayer.id)}>🗑️ Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente AddPlayerForm
function AddPlayerForm({ addPlayer, showNotification, setCurrentPage }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
      name: '',
      birth_year: new Date().getFullYear() - 20,
      team: '',
      nationality: '',
      height: '',
      weight: '',
      general_role: 'Centrocampo',
      specific_position: '',
      preferred_foot: 'Destro',
      athletic_skills: '',
      technical_skills: '',
      tactical_skills: '',
      current_value: 3,
      potential_value: 3,
      data_potential_value: 3,
      market_value: '',
      contract_expiry: '',
      priority: 'Media',
      recommended_action: 'Monitorare',
      director_feedback: 'Da valutare',
      check_type: 'Live',
      scout_name: '',
      scouting_date: new Date().toISOString().split('T')[0],
      injuries: '',
      strong_points: '',
      weak_points: '',
      comparison: '',
      notes: ''
    });

    const totalSteps = 3;
    const currentYear = new Date().getFullYear();
    const age = currentYear - formData.birth_year;

    const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.name.trim()) {
        showNotification('Il nome è obbligatorio!', 'error');
        return;
      }

      try {
        await addPlayer(formData);
        showNotification('Giocatore aggiunto con successo!', 'success');
        setCurrentPage('database');
      } catch (error) {
        showNotification('Errore nel salvataggio', 'error');
        console.error(error);
      }
    };

    const nextStep = () => {
      if (currentStep === 1 && !formData.name.trim()) {
        showNotification('Inserisci almeno il nome del giocatore', 'error');
        return;
      }
      if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
      if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 fade-in">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Aggiungi Nuovo Giocatore</h2>
          <p className="text-gray-600">Compila tutti i campi per aggiungere un nuovo giocatore al database</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-2 mx-4 rounded-full ${
                    step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 font-medium text-center">
            <span className={currentStep === 1 ? 'text-blue-600 font-bold' : ''}>📋 Informazioni Generali</span>
            <span className={currentStep === 2 ? 'text-blue-600 font-bold' : ''}>⚽ Caratteristiche & Valutazioni</span>
            <span className={currentStep === 3 ? 'text-blue-600 font-bold' : ''}>📝 Analisi & Report</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Informazioni Generali */}
          {currentStep === 1 && (
            <div className="space-y-6 fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6">📋 Informazioni Generali</h3>
              
              {/* Informazioni Base */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Dati Anagrafici</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Mario Rossi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anno Nascita</label>
                    <input
                      type="number"
                      min="1990"
                      max={currentYear - 15}
                      value={formData.birth_year}
                      onChange={(e) => handleChange('birth_year', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Età: {age} anni</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nazionalità</label>
                    <select
                      value={formData.nationality}
                      onChange={(e) => handleChange('nationality', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Seleziona...</option>
                      <option value="🇮🇹 Italia">🇮🇹 Italia</option>
                      <option value="🇫🇷 Francia">🇫🇷 Francia</option>
                      <option value="🇪🇸 Spagna">🇪🇸 Spagna</option>
                      <option value="🇩🇪 Germania">🇩🇪 Germania</option>
                      <option value="🇬🇧 Inghilterra">🇬🇧 Inghilterra</option>
                      <option value="🇧🇷 Brasile">🇧🇷 Brasile</option>
                      <option value="🇦🇷 Argentina">🇦🇷 Argentina</option>
                      <option value="🇳🇱 Olanda">🇳🇱 Olanda</option>
                      <option value="🇵🇹 Portogallo">🇵🇹 Portogallo</option>
                      <option value="🇸🇳 Senegal">🇸🇳 Senegal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Squadra e Posizione */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Squadra e Ruolo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Squadra Attuale</label>
                    <input
                      type="text"
                      value={formData.team}
                      onChange={(e) => handleChange('team', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="AC Milan, Juventus, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ruolo Principale</label>
                    <select
                      value={formData.general_role}
                      onChange={(e) => handleChange('general_role', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Portiere">🥅 Portiere</option>
                      <option value="Difensore">🛡️ Difensore</option>
                      <option value="Centrocampo">⚽ Centrocampo</option>
                      <option value="Attaccante">🎯 Attaccante</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Caratteristiche Fisiche */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Caratteristiche Fisiche</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Altezza (cm)</label>
                    <input
                      type="number"
                      min="150"
                      max="220"
                      value={formData.height}
                      onChange={(e) => handleChange('height', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="180"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      min="50"
                      max="120"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Piede</label>
                    <select
                      value={formData.preferred_foot}
                      onChange={(e) => handleChange('preferred_foot', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Destro">👉 Destro</option>
                      <option value="Sinistro">👈 Sinistro</option>
                      <option value="Ambidestro">👐 Ambidestro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posizione Specifica</label>
                    <input
                      type="text"
                      value={formData.specific_position}
                      onChange={(e) => handleChange('specific_position', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Mediano, Ala destra..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Caratteristiche & Valutazioni */}
          {currentStep === 2 && (
            <div className="space-y-6 fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6">⚽ Caratteristiche & Valutazioni</h3>
              
              {/* Valutazioni con Slider */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-4">⭐ Valutazioni (1-5)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valore Attuale</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      value={formData.current_value}
                      onChange={(e) => handleChange('current_value', parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Scarso</span>
                      <span className="font-bold text-lg text-blue-600">{formData.current_value}⭐</span>
                      <span>Eccellente</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Potenziale</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      value={formData.potential_value}
                      onChange={(e) => handleChange('potential_value', parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Scarso</span>
                      <span className="font-bold text-lg text-green-600">{formData.potential_value}⭐</span>
                      <span>Eccellente</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Potenziale Dati</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      value={formData.data_potential_value}
                      onChange={(e) => handleChange('data_potential_value', parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Scarso</span>
                      <span className="font-bold text-lg text-purple-600">{formData.data_potential_value}⭐</span>
                      <span>Eccellente</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Compatte */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">🎯 Competenze (separare con virgole)</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">💪 Abilità Atletiche</label>
                    <input
                      type="text"
                      value={formData.athletic_skills}
                      onChange={(e) => handleChange('athletic_skills', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Velocità, Accelerazione, Resistenza, Agilità, Forza..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">⚽ Abilità Tecniche</label>
                    <input
                      type="text"
                      value={formData.technical_skills}
                      onChange={(e) => handleChange('technical_skills', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Controllo palla, Passaggi, Tiro, Dribbling, Cross..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">🧠 Abilità Tattiche</label>
                    <input
                      type="text"
                      value={formData.tactical_skills}
                      onChange={(e) => handleChange('tactical_skills', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Posizionamento, Lettura del gioco, Pressing, Coperture..."
                    />
                  </div>
                </div>
              </div>

              {/* Informazioni Economiche e Priorità */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">💰 Valutazioni Economiche</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valore di Mercato</label>
                    <input
                      type="text"
                      value={formData.market_value}
                      onChange={(e) => handleChange('market_value', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="2.5M €, 500K €..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contratto fino al</label>
                    <input
                      type="text"
                      value={formData.contract_expiry}
                      onChange={(e) => handleChange('contract_expiry', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="2026, 2025..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorità</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Alta">🔴 Alta</option>
                      <option value="Media">🟡 Media</option>
                      <option value="Bassa">🟢 Bassa</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Analisi & Report */}
          {currentStep === 3 && (
            <div className="space-y-6 fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6">📝 Analisi & Report</h3>
              
              {/* Punti di Forza e Debolezza */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">💪 Analisi Punti di Forza e Debolezza</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">✅ Punti di Forza</label>
                    <textarea
                      rows="3"
                      value={formData.strong_points}
                      onChange={(e) => handleChange('strong_points', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Visione di gioco, Tiro da fuori, Inserimenti..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">❌ Punti Deboli</label>
                    <textarea
                      rows="3"
                      value={formData.weak_points}
                      onChange={(e) => handleChange('weak_points', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Velocità, Contrasti aerei, Marcatura..."
                    />
                  </div>
                </div>
              </div>

              {/* Confronti e Azioni */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">🔍 Confronti e Raccomandazioni</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confronto con Altri Giocatori</label>
                    <input
                      type="text"
                      value={formData.comparison}
                      onChange={(e) => handleChange('comparison', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Stile simile a Pogba giovane..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Azione Consigliata</label>
                    <select
                      value={formData.recommended_action}
                      onChange={(e) => handleChange('recommended_action', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Monitorare">👀 Monitorare</option>
                      <option value="Approfondire">🔍 Approfondire</option>
                      <option value="Contattare">📞 Contattare</option>
                      <option value="Scartare">❌ Scartare</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Informazioni Scout */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">👤 Informazioni Scout</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Scout</label>
                    <input
                      type="text"
                      value={formData.scout_name}
                      onChange={(e) => handleChange('scout_name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Marco Rossi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Scouting</label>
                    <input
                      type="date"
                      value={formData.scouting_date}
                      onChange={(e) => handleChange('scouting_date', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo di Check</label>
                    <select
                      value={formData.check_type}
                      onChange={(e) => handleChange('check_type', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Live">🔴 Live</option>
                      <option value="Video">📹 Video</option>
                      <option value="Live/Video">🔴📹 Live/Video</option>
                      <option value="Dati">📊 Dati</option>
                      <option value="Live/Video + Dati">🔴📹📊 Live/Video + Dati</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Direttore</label>
                    <select
                      value={formData.director_feedback}
                      onChange={(e) => handleChange('director_feedback', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Mi piace">👍 Mi piace</option>
                      <option value="Da valutare">🤔 Da valutare</option>
                      <option value="Non mi convince">👎 Non mi convince</option>
                      <option value="Interessante">⭐ Interessante</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Report Finale */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">📝 Report Descrittivo Completo</h4>
                <textarea
                  rows="5"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Inserisci un report dettagliato: stile di gioco, caratteristiche principali, adattabilità al sistema, potenziale di crescita, raccomandazioni..."
                />
                <p className="text-xs text-gray-500 mt-2">💡 Includi analisi tecnica, tattica, fisica e mentale del giocatore</p>
              </div>

              {/* Infortuni */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">🏥 Situazione Infortuni</h4>
                <input
                  type="text"
                  value={formData.injuries}
                  onChange={(e) => handleChange('injuries', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Nessuno, Caviglia (recuperato), Ginocchio (in riabilitazione)..."
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentStep === 1 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Indietro
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Avanti
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-save mr-2"></i>
                Salva Giocatore
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

export default App;

/* 
========================================
ISTRUZIONI COMPLETE PER L'INSTALLAZIONE
========================================

1. CREA IL COMPONENTE TRANSFERMARKT:
   File: src/components/PlayerSearchTransfermarkt.js
   (Copia il codice dall'artifact "PlayerSearchTransfermarkt.js")

2. FILE .env (nella root del progetto):
   REACT_APP_SUPABASE_URL=https://tuoprogetto.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=tua_chiave_anon_qui

3. SCHEMA DATABASE SUPABASE AGGIORNATO:

CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Informazioni Base
    name VARCHAR(255) NOT NULL,
    birth_year INTEGER,
    team VARCHAR(255),
    nationality VARCHAR(100),
    height VARCHAR(20),
    weight VARCHAR(20),
    
    -- Ruolo e Posizione
    general_role VARCHAR(100),
    specific_position VARCHAR(100),
    functions_labels TEXT,
    preferred_foot VARCHAR(20),
    
    -- Caratteristiche
    athleticism TEXT,
    athletic_evaluation INTEGER,
    key_characteristics TEXT,
    
    -- Valutazioni (1-5)
    potential_value INTEGER DEFAULT 3,
    current_value INTEGER DEFAULT 3,
    data_potential_value INTEGER DEFAULT 3,
    
    -- Info Economiche
    market_value VARCHAR(50),
    contract_expiry VARCHAR(50),
    transfermarkt_link TEXT,
    
    -- Analisi Scout
    notes TEXT,
    strong_points TEXT,
    weak_points TEXT,
    comparison TEXT,
    injuries TEXT,
    
    -- Gestione e Priorità
    priority VARCHAR(20) DEFAULT 'Media',
    recommended_action VARCHAR(50),
    director_feedback VARCHAR(100),
    check_type VARCHAR(100),
    outcome VARCHAR(100),
    
    -- Info Scouting
    scout_name VARCHAR(100),
    scouting_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Indici per performance
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_players_general_role ON players(general_role);
CREATE INDEX idx_players_priority ON players(priority);
CREATE INDEX idx_players_is_archived ON players(is_archived);

-- Trigger per updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at 
    BEFORE UPDATE ON players 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (opzionale ma consigliato)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy per permettere lettura a tutti gli utenti autenticati
CREATE POLICY "Enable read access for all users" ON players
    FOR SELECT USING (true);

-- Policy per permettere insert/update/delete a tutti
CREATE POLICY "Enable insert for all users" ON players
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON players
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON players
    FOR DELETE USING (true);

4. INSTALLAZIONE DIPENDENZE:
   npm install @supabase/supabase-js react-hot-toast

5. STRUTTURA FILE NECESSARIA:
   
   scouting-app/
   ├── public/
   │   └── index.html (con Font Awesome)
   ├── src/
   │   ├── components/
   │   │   └── PlayerSearchTransfermarkt.js  ← CREA QUESTO FILE!
   │   ├── App.js                             ← QUESTO FILE
   │   ├── App.css                            ← CSS esistente
   │   └── index.js
   ├── .env                                   ← CREA QUESTO FILE!
   ├── package.json
   └── README.md

6. CONTENT DI public/index.html:
   Assicurati che includa Font Awesome:
   
   <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

7. AVVIA L'APPLICAZIONE:
   npm start

========================================
COME USARE LA NUOVA FUNZIONALITÀ
========================================

1. Clicca su "Nuovo Giocatore"
2. Vedrai la sezione "Importa da Transfermarkt" in alto
3. Digita il nome di un giocatore (es: "Haaland", "Messi", "Mbappé")
4. Aspetta che appaiano i suggerimenti nel dropdown
5. Clicca sul giocatore desiderato
6. ✅ Il form si compila automaticamente!
7. Completa eventuali campi mancanti
8. Clicca "Aggiungi Giocatore"

========================================
CAMPI IMPORTATI AUTOMATICAMENTE
========================================

Da Transfermarkt vengono importati:
✅ Nome completo
✅ Anno di nascita (estratto dalla data)
✅ Squadra attuale
✅ Nazionalità
✅ Altezza
✅ Ruolo (mappato al sistema italiano)
✅ Posizione specifica
✅ Piede preferito
✅ Valore di mercato
✅ Link al profilo Transfermarkt
✅ Note automatiche con info base

Campi da completare manualmente:
📝 Valutazioni (attuale, potenziale, dati)
📝 Punti di forza e debolezza
📝 Note scout dettagliate
📝 Priorità e azioni raccomandate
📝 Info scouting (scout, data, tipo check)

========================================
MAPPATURA RUOLI TRANSFERMARKT → DATABASE
========================================

Transfermarkt              → Database
----------------------------------------
Goalkeeper                 → Portiere
Centre-Back                → Difensore
Left-Back / Right-Back     → Terzino
Defensive Midfield         → Centrocampo
Central Midfield           → Centrocampo
Attacking Midfield         → Centrocampo
Left Winger / Right Winger → Ala
Left Midfield / Right Mid  → Ala
Second Striker             → Attaccante
Centre-Forward             → Attaccante

Piede:
right → Destro
left  → Sinistro
both  → Ambidestro

========================================
TROUBLESHOOTING
========================================

❌ Errore: "Cannot find module PlayerSearchTransfermarkt"
✅ Soluzione: Verifica di aver creato il file in src/components/PlayerSearchTransfermarkt.js

❌ Dropdown non appare dopo la ricerca
✅ Soluzione: 
   - Controlla la console per errori di rete
   - Verifica che l'API Transfermarkt sia raggiungibile
   - Assicurati di digitare almeno 2 caratteri
   - Prova con nomi famosi: "Messi", "Haaland", "Ronaldo"

❌ Dati non vengono compilati automaticamente
✅ Soluzione:
   - Verifica che la funzione handleImportFromTransfermarkt sia presente
   - Controlla che il prop onSelectPlayer sia passato correttamente
   - Guarda la console per eventuali errori di mapping

❌ Errore: "Rate limit exceeded"
✅ Soluzione: L'API ha limiti di richieste. Aspetta qualche minuto prima di riprovare

❌ Font Awesome non carica le icone
✅ Soluzione: Aggiungi nel <head> di public/index.html:
   <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

❌ Errore Supabase: "relation players does not exist"
✅ Soluzione: Crea la tabella nel database usando lo schema SQL fornito sopra

========================================
FEATURES IMPLEMENTATE
========================================

✅ Ricerca in tempo reale con debouncing (500ms)
✅ Dropdown autocomplete con suggerimenti
✅ Caricamento dati completi da API Transfermarkt
✅ Mappatura automatica al tuo schema database
✅ Gestione errori e stati di caricamento
✅ Toast notifications per feedback utente
✅ Integrazione seamless nel form esistente
✅ Supporto per modifica e dettagli giocatore
✅ Real-time updates con Supabase subscriptions
✅ Filtri per ruolo e ricerca testuale
✅ Design responsive e moderno
✅ Link diretto al profilo Transfermarkt

========================================
PROSSIMI SVILUPPI CONSIGLIATI
========================================

1. Aggiungere autenticazione utenti (Supabase Auth)
2. Implementare export dati in Excel/PDF
3. Creare dashboard con statistiche e grafici
4. Aggiungere sistema di tagging e categorie
5. Implementare comparazione tra giocatori
6. Aggiungere upload foto/video giocatori
7. Sistema di notifiche per scadenze contratti
8. Report automatici personalizzabili
9. Integrazione con altre API (Opta, WyScout)
10. App mobile con React Native

========================================
SUPPORTO E RISORSE
========================================

📚 Documentazione Supabase: https://supabase.com/docs
📚 Documentazione React: https://react.dev
🌐 API Transfermarkt: https://transfermarkt-api.fly.dev/docs
💬 Font Awesome: https://fontawesome.com/icons

Per problemi o domande:
- Controlla la console del browser (F12)
- Verifica i log di Supabase nel dashboard
- Testa le API endpoint direttamente nel browser

========================================
BUON LAVORO! 🚀⚽
========================================
*/