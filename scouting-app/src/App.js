// src/App.js - Main App with Complete Interface
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
import { 
  findDuplicatePlayers,
  findPlayerByTransfermarktUrl,
  createDuplicateMessage 
} from './utils/playerDeduplication';

function AppContent() {
  const { user, profile, loading: authLoading, signOut, canAddPlayers, canDeletePlayers, canAddReports, canManageLists } = useAuth();
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerForReport, setPlayerForReport] = useState(null);
  const [selectedListForFormation, setSelectedListForFormation] = useState(null);

  // Load players from database
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
      console.error('Loading error:', error);
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

  // Delete player
  const deletePlayer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPlayers();
    } catch (error) {
      console.error('Deletion error:', error);
    }
  };

  const scoutedPlayers = players.filter(p => p.is_scouted !== false).length;
  const signalazioni = players.filter(p => p.is_scouted === false).length;
  const totalPlayers = players.length;

  // Show loading screen during auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login
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
            title="📌 Bookmarks"
            emptyMessage="No bookmarks. Add a player without filling the report to create a bookmark."
            isSignalazione={true}
          />
        )}
        
        {currentPage === 'add' && canAddPlayers && (
          <PlayerForm 
            onSave={async (playerData) => {
              try {
                // ============================================
                // FINAL DUPLICATE CHECK (Server-side)
                // ============================================
                
                // 1. Load all existing players
                const { data: allPlayers, error: fetchError } = await supabase
                  .from('players')
                  .select('*');
                
                if (fetchError) throw fetchError;
                
                // 2. Check Transfermarkt link
                if (playerData.transfermarkt_link) {
                  const existingByUrl = findPlayerByTransfermarktUrl(
                    playerData.transfermarkt_link, 
                    allPlayers || []
                  );
                  
                  if (existingByUrl) {
                    alert(`❌ Transfermarkt link already used!\n\n${createDuplicateMessage(existingByUrl)}\n\nGo to Database and fill a report for this player.`);
                    return; // Block insertion
                  }
                }
                
                // 3. Check unique ID (name + nationality + year)
                const newPlayer = {
                  name: playerData.name,
                  nationality: playerData.nationality,
                  birth_year: playerData.birth_year
                };
                
                const duplicates = findDuplicatePlayers(newPlayer, allPlayers || []);
                
                if (duplicates.length > 0) {
                  const duplicate = duplicates[0];
                  alert(`❌ Player already exists!\n\n${createDuplicateMessage(duplicate)}\n\nGo to Database and fill a report for this player.`);
                  return; // Block insertion
                }
                
                // ============================================
                // PLAYER INSERTION (if no duplicate)
                // ============================================
                
                // Separate player fields from report fields
                const reportFields = [
                  'scout_name', 'scout_role', 'check_type', 'match_name', 'match_date',
                  'athletic_data_rating', 'final_rating', 'current_value', 'potential_value',
                  'strong_points', 'weak_points', 'notes'
                ];
                
                // Determine if it's a bookmark (without report) or scouted player (with report)
                // Use the _hasReport flag to understand if the user opened the report section
                const hasOpenedReport = playerData._hasReport === true;
                
                // Report data - Only if the section was opened
                const reportData = hasOpenedReport ? Object.entries(playerData).reduce((acc, [key, value]) => {
                  if (reportFields.includes(key) && value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                  }
                  return acc;
                }, {}) : {};
                
                // A player is "scouted" only if they opened the report AND filled the scout name
                const isScouted = hasOpenedReport && !!reportData.scout_name && reportData.scout_name.trim() !== '';
                
                console.log('🔍 hasOpenedReport:', hasOpenedReport);
                console.log('🔍 reportData:', reportData);
                
                // Player data (excluding report fields and internal flags)
                const playerFields = Object.entries(playerData).reduce((acc, [key, value]) => {
                  // Exclude report fields and internal flags (starting with _)
                  if (!reportFields.includes(key) && !key.startsWith('_')) {
                    // If there's no report, don't save ratings
                    if (!isScouted && (key === 'current_value' || key === 'potential_value')) {
                      console.log(`⚠️ Skipped field ${key} because there's no report`);
                      return acc; // Skip these fields
                    }
                    acc[key] = value === '' ? null : value;
                  }
                  return acc;
                }, {});
                
                console.log('🔍 isScouted:', isScouted);
                console.log('📝 playerFields:', playerFields);
                
                // Fix preferred_foot: normalize the value
                if (playerFields.preferred_foot) {
                  const foot = playerFields.preferred_foot.toLowerCase();
                  if (foot.includes('dest') || foot === 'right') {
                    playerFields.preferred_foot = 'Destro';
                  } else if (foot.includes('sin') || foot === 'left') {
                    playerFields.preferred_foot = 'Sinistro';
                  } else if (foot.includes('entr') || foot.includes('both') || foot.includes('amb')) {
                    playerFields.preferred_foot = 'Entrambi';
                  } else {
                    // Unrecognized value, use default
                    playerFields.preferred_foot = 'Destro';
                  }
                }
                
                // Insert the player
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
                
                // Insert the first report if there's scout data
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
                    console.error('Report insertion error:', reportError);
                    alert('⚠️ Player added but report error: ' + reportError.message);
                  } else {
                    alert('✅ Player and first report added successfully!\n\nThe player has been added to the Database.');
                  }
                } else {
                  alert('✅ Bookmark added successfully!\n\nThe player has been added to Bookmarks (without report).');
                }
                
                fetchPlayers();
                setCurrentPage(isScouted ? 'database' : 'segnalazioni');
              } catch (error) {
                console.error('Insertion error:', error);
                alert(`Error adding player: ${error.message}`);
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
        
        {/* Access denied message */}
        {((currentPage === 'add' && !canAddPlayers) || 
          (currentPage === 'lists' && !canManageLists)) && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this section.</p>
            <p className="text-sm text-gray-500 mt-2">Contact the administrator to request access.</p>
          </div>
        )}
      </div>

      {/* Player Card Modal */}
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

      {/* Fill Report Modal */}
      {playerForReport && canAddReports && (
        <PlayerReports 
          player={playerForReport}
          scoutName={profile.scout_name || profile.full_name}
          onClose={() => {
            setPlayerForReport(null);
            fetchPlayers(); // Reload players to update is_scouted
          }} 
        />
      )}

      {/* Formation View Modal */}
      {selectedListForFormation && (
        <FormationField 
          list={selectedListForFormation}
          onClose={() => setSelectedListForFormation(null)}
        />
      )}
    </div>
  );
}

// Wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
