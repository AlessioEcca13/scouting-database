// App.js - VERSIONE COMPLETA CON DATABASE SUPABASE
// 
// ISTRUZIONI SETUP:
// 1. Crea progetto: npx create-react-app scouting-app
// 2. Installa: npm install @supabase/supabase-js react-hot-toast
// 3. Crea account su supabase.com e ottieni credenziali
// 4. Sostituisci SUPABASE_URL e SUPABASE_KEY sotto
// 5. Crea tabella 'players' in Supabase con schema fornito

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

// ⚠️ SOSTITUISCI CON LE TUE CREDENZIALI SUPABASE
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Verifica che le credenziali siano presenti
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Credenziali Supabase mancanti!', { SUPABASE_URL, SUPABASE_KEY });
}

// Inizializza client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
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

  // Aggiungi nuovo giocatore
  async function addPlayer(playerData) {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{
          ...playerData,
          created_at: new Date().toISOString(),
          created_by: null,
          updated_by: null
        }])
        .select()
        .single();

      if (error) throw error;

      setPlayers([...players, data]);
      toast.success('Giocatore aggiunto con successo!');
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Errore inserimento:', error);
      toast.error(`Errore nell'aggiunta del giocatore: ${error.message}`);
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
      toast.success('Giocatore aggiornato!');
      
    } catch (error) {
      console.error('Errore aggiornamento:', error);
      toast.error(`Errore nell'aggiornamento: ${error.message}`);
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
      toast.success('Giocatore eliminato');
      setSelectedPlayer(null);
      
    } catch (error) {
      console.error('Errore eliminazione:', error);
      toast.error('Errore nell\'eliminazione');
    }
  }

  // Componente Form Giocatore
  function PlayerForm({ player, onSave, onClose }) {
    const [formData, setFormData] = useState(player || {
      name: '',
      birth_year: 2000,
      team: '',
      nationality: '',
      general_role: 'Centrocampo',
      specific_position: '',
      functions_labels: '',
      preferred_foot: 'Destro',
      athleticism: '',
      potential_value: 3,
      current_value: 2,
      data_potential_value: 3,
      notes: '',
      director_feedback: '',
      check_type: 'Live/Video'
    });

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
        <div className="modal-content">
          <h2>{player ? 'Modifica Giocatore' : 'Nuovo Giocatore'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              </div>

              <div className="form-group">
                <label>Squadra</label>
                <input
                  type="text"
                  value={formData.team}
                  onChange={(e) => setFormData({...formData, team: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Nazionalità</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Ruolo</label>
                <select
                  value={formData.general_role}
                  onChange={(e) => setFormData({...formData, general_role: e.target.value})}
                >
                  <option value="Portiere">Portiere</option>
                  <option value="Difensore">Difensore</option>
                  <option value="Terzino">Terzino</option>
                  <option value="Centrocampo">Centrocampo</option>
                  <option value="Ala">Ala</option>
                  <option value="Attaccante">Attaccante</option>
                </select>
              </div>

              <div className="form-group">
                <label>Piede</label>
                <select
                  value={formData.preferred_foot}
                  onChange={(e) => setFormData({...formData, preferred_foot: e.target.value})}
                >
                  <option value="Destro">Destro</option>
                  <option value="Sinistro">Sinistro</option>
                  <option value="Ambidestro">Ambidestro</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Note Scout</label>
                <textarea
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Valore Potenziale (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.potential_value}
                  onChange={(e) => setFormData({...formData, potential_value: parseInt(e.target.value)})}
                />
                <span>{formData.potential_value} ⭐</span>
              </div>

              <div className="form-group">
                <label>Valore Attuale (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.current_value}
                  onChange={(e) => setFormData({...formData, current_value: parseInt(e.target.value)})}
                />
                <span>{formData.current_value} ⭐</span>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Annulla
              </button>
              <button type="submit" className="btn-primary">
                {player ? 'Salva Modifiche' : 'Aggiungi Giocatore'}
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
          <p>🏆 {player.team}</p>
          <p>⚽ {player.general_role}</p>
          <p>👟 {player.preferred_foot}</p>
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

  // Rendering principale
  return (
    <div className="app">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="app-header">
        <h1>⚽ Scouting Database</h1>
        <p>Sistema Professionale con Database Supabase</p>
      </header>

      {/* Controlli */}
      <div className="controls">
        <input
          type="text"
          placeholder="🔍 Cerca per nome o squadra..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="">Tutti i ruoli</option>
          <option value="Portiere">Portiere</option>
          <option value="Difensore">Difensore</option>
          <option value="Terzino">Terzino</option>
          <option value="Centrocampo">Centrocampo</option>
          <option value="Ala">Ala</option>
          <option value="Attaccante">Attaccante</option>
        </select>

        <button onClick={fetchPlayers} className="btn-refresh">
          🔄 Aggiorna
        </button>

        <button onClick={() => setShowAddForm(true)} className="btn-add">
          ➕ Nuovo Giocatore
        </button>
      </div>

      {/* Stato Database */}
      <div className="db-status">
        {SUPABASE_URL === 'https://tuoprogetto.supabase.co' ? (
          <div className="warning">
            ⚠️ Database non configurato! Sostituisci SUPABASE_URL e SUPABASE_KEY nel codice.
          </div>
        ) : (
          <div className="success">
            ✅ Connesso a Supabase Database
          </div>
        )}
      </div>

      {/* Lista Giocatori */}
      {loading ? (
        <div className="loading">Caricamento giocatori...</div>
      ) : (
        <div className="players-grid">
          {players.length === 0 ? (
            <div className="empty-state">
              <p>Nessun giocatore trovato</p>
              <button onClick={() => setShowAddForm(true)}>
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
              <div><strong>Posizione:</strong> {selectedPlayer.specific_position}</div>
              <div><strong>Funzioni:</strong> {selectedPlayer.functions_labels}</div>
              <div><strong>Atletismo:</strong> {selectedPlayer.athleticism}</div>
              <div><strong>Check:</strong> {selectedPlayer.check_type}</div>
            </div>
            {selectedPlayer.notes && (
              <div className="notes-section">
                <h3>Note Scout:</h3>
                <p>{selectedPlayer.notes}</p>
              </div>
            )}
            <div className="detail-actions">
              <button onClick={() => {
                setShowAddForm(selectedPlayer);
                setSelectedPlayer(null);
              }}>Modifica</button>
              <button onClick={() => deletePlayer(selectedPlayer.id)}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

/* 
PROSSIMI PASSI:
1. npm start per testare in locale
2. Configura Supabase (vedi istruzioni sopra)
3. Deploy su Vercel per versione online

SCHEMA DATABASE SUPABASE DA CREARE:
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birth_year INTEGER,
    team VARCHAR(255),
    nationality VARCHAR(100),
    general_role VARCHAR(100),
    specific_position VARCHAR(100),
    functions_labels TEXT,
    preferred_foot VARCHAR(20),
    athleticism TEXT,
    potential_value INTEGER,
    current_value INTEGER,
    data_potential_value INTEGER,
    notes TEXT,
    director_feedback VARCHAR(100),
    check_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
*/
