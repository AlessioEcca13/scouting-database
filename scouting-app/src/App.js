// src/App.js - App principale con Interfaccia Completa
import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Database from './components/Database';
import PlayerForm from './components/PlayerForm';
import PlayerDetailCardFM from './components/PlayerDetailCardFM';
import AllReports from './components/AllReports';
import PlayerReports from './components/PlayerReports';
import PlayerLists from './components/PlayerLists';
import FormationField from './components/FormationField';
import TacticalFieldSimple from './components/TacticalFieldSimple';

function AppContent() {
  const { user, profile, loading: authLoading, signOut, canAddPlayers, canDeletePlayers, canAddReports, canManageLists } = useAuth();
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerForReport, setPlayerForReport] = useState(null);
  const [selectedListForFormation, setSelectedListForFormation] = useState(null);

  // Carica giocatori dal database
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Errore caricamento:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
    
    // Real-time subscription
    const subscription = supabase
      .channel('players_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players' },
        () => fetchPlayers()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [fetchPlayers]);

  // Elimina giocatore
  const deletePlayer = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo giocatore?')) return;
    
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPlayers();
    } catch (error) {
      console.error('Errore eliminazione:', error);
    }
  };

  const scoutedPlayers = players.filter(p => p.is_scouted !== false).length;
  const signalazioni = players.filter(p => p.is_scouted === false).length;
  const totalPlayers = players.length;

  // Mostra schermata di caricamento durante auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Se non autenticato, mostra login
  if (!user || !profile) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        playersCount={`${totalPlayers} DB • ${scoutedPlayers} Scouted • ${signalazioni} Segn.`}
        userProfile={profile}
        onLogout={signOut}
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {currentPage === 'dashboard' && (
          <Dashboard 
            players={players}
            scoutedCount={scoutedPlayers}
            signalazioniCount={signalazioni}
            onSelectPlayer={setSelectedPlayer}
          />
        )}
        
        {currentPage === 'database' && (
          <Database 
            players={players.filter(p => p.is_scouted !== false)}
            onSelectPlayer={setSelectedPlayer}
            onDeletePlayer={canDeletePlayers ? deletePlayer : null}
            onAddReport={canAddReports ? (player) => setPlayerForReport(player) : null}
            loading={loading}
            onRefresh={fetchPlayers}
          />
        )}
        
        {currentPage === 'segnalazioni' && (
          <Database 
            players={players.filter(p => p.is_scouted === false)}
            onSelectPlayer={setSelectedPlayer}
            onDeletePlayer={canDeletePlayers ? deletePlayer : null}
            onAddReport={canAddReports ? (player) => setPlayerForReport(player) : null}
            loading={loading}
            onRefresh={fetchPlayers}
            title="📌 Segnalazioni"
            emptyMessage="Nessuna segnalazione. Aggiungi un giocatore senza compilare il report per creare una segnalazione."
            isSignalazione={true}
          />
        )}
        
        {currentPage === 'add' && canAddPlayers && (
          <PlayerForm 
            onSave={async (playerData) => {
              try {
                // Separa i campi del giocatore dai campi del report
                const reportFields = [
                  'scout_name', 'scout_role', 'check_type', 'match_name', 'match_date',
                  'athletic_data_rating', 'final_rating', 'current_value', 'potential_value',
                  'strong_points', 'weak_points', 'notes'
                ];
                
                // Determina se è una segnalazione (senza report) o giocatore scouted (con report)
                // Usa il flag _hasReport per capire se l'utente ha aperto la sezione report
                const hasOpenedReport = playerData._hasReport === true;
                
                // Dati del report - Solo se la sezione è stata aperta
                const reportData = hasOpenedReport ? Object.entries(playerData).reduce((acc, [key, value]) => {
                  if (reportFields.includes(key) && value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                  }
                  return acc;
                }, {}) : {};
                
                // Un giocatore è "scouted" solo se ha aperto il report E compilato il nome scout
                const isScouted = hasOpenedReport && !!reportData.scout_name && reportData.scout_name.trim() !== '';
                
                console.log('🔍 hasOpenedReport:', hasOpenedReport);
                console.log('🔍 reportData:', reportData);
                
                // Dati del giocatore (esclusi i campi del report e flag interni)
                const playerFields = Object.entries(playerData).reduce((acc, [key, value]) => {
                  // Escludi campi del report e flag interni (che iniziano con _)
                  if (!reportFields.includes(key) && !key.startsWith('_')) {
                    // Se non c'è report, non salvare le valutazioni
                    if (!isScouted && (key === 'current_value' || key === 'potential_value')) {
                      console.log(`⚠️ Saltato campo ${key} perché non c'è report`);
                      return acc; // Salta questi campi
                    }
                    acc[key] = value === '' ? null : value;
                  }
                  return acc;
                }, {});
                
                console.log('🔍 isScouted:', isScouted);
                console.log('📝 playerFields:', playerFields);
                
                // Inserisci il giocatore
                const { data: player, error: playerError } = await supabase
                  .from('players')
                  .insert([{
                    ...playerFields,
                    is_scouted: isScouted,
                    created_at: new Date().toISOString()
                  }])
                  .select()
                  .single();

                if (playerError) throw playerError;
                
                // Inserisci il primo report se ci sono dati dello scout
                if (isScouted) {
                  const { error: reportError } = await supabase
                    .from('player_reports')
                    .insert([{
                      player_id: player.id,
                      scout_name: reportData.scout_name,
                      scout_role: reportData.scout_role,
                      check_type: reportData.check_type,
                      match_name: reportData.match_name,
                      match_date: reportData.match_date,
                      athletic_data_rating: reportData.athletic_data_rating,
                      final_rating: reportData.final_rating,
                      current_value: reportData.current_value || 3,
                      potential_value: reportData.potential_value || 3,
                      strengths: reportData.strong_points,
                      weaknesses: reportData.weak_points,
                      notes: reportData.notes,
                      report_date: new Date().toISOString()
                    }]);
                  
                  if (reportError) {
                    console.error('Errore inserimento report:', reportError);
                    alert('⚠️ Giocatore aggiunto ma errore nel report: ' + reportError.message);
                  } else {
                    alert('✅ Giocatore e primo report aggiunti con successo!\n\nIl giocatore è stato aggiunto al Database.');
                  }
                } else {
                  alert('✅ Segnalazione aggiunta con successo!\n\nIl giocatore è stato aggiunto alle Segnalazioni (senza report).');
                }
                
                fetchPlayers();
                setCurrentPage(isScouted ? 'database' : 'segnalazioni');
              } catch (error) {
                console.error('Errore inserimento:', error);
                alert(`Errore nell'aggiunta del giocatore: ${error.message}`);
              }
            }}
            onCancel={() => setCurrentPage('database')}
          />
        )}
        
        {currentPage === 'reports' && (
          <AllReports onPlayerClick={(player) => setSelectedPlayer(player)} />
        )}
        
        {currentPage === 'lists' && canManageLists && (
          <PlayerLists onViewFormation={(list) => setSelectedListForFormation(list)} />
        )}
        
        {currentPage === 'tactical' && (
          <TacticalFieldSimple />
        )}
        
        {/* Messaggio permessi negati */}
        {((currentPage === 'add' && !canAddPlayers) || 
          (currentPage === 'lists' && !canManageLists)) && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Accesso Negato</h2>
            <p className="text-gray-600">Non hai i permessi per accedere a questa sezione.</p>
            <p className="text-sm text-gray-500 mt-2">Contatta l'amministratore per richiedere l'accesso.</p>
          </div>
        )}
      </div>

      {/* Modale Scheda Giocatore */}
      {selectedPlayer && (
        <PlayerDetailCardFM 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)}
          onAddReport={canAddReports ? (player) => {
            setPlayerForReport(player);
            setSelectedPlayer(null);
          } : null}
        />
      )}

      {/* Modale Compila Report */}
      {playerForReport && canAddReports && (
        <PlayerReports 
          player={playerForReport}
          scoutName={profile.scout_name || profile.full_name}
          onClose={() => {
            setPlayerForReport(null);
            fetchPlayers(); // Ricarica i giocatori per aggiornare is_scouted
          }} 
        />
      )}

      {/* Modale Visualizzazione Formazione */}
      {selectedListForFormation && (
        <FormationField 
          list={selectedListForFormation}
          onClose={() => setSelectedListForFormation(null)}
        />
      )}
    </div>
  );
}

// Wrapper con AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
