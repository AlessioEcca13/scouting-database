// src/components/PlayerLists.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

function PlayerLists({ onViewFormation }) {
  const [lists, setLists] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState('');

  useEffect(() => {
    fetchLists();
    fetchPlayers();
  }, []);

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('player_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading lists:', error);
        if (error.message.includes('relation "player_lists" does not exist')) {
          toast.error('⚠️ Table player_lists not found! You need to run the SQL migration.', {
            duration: 5000
          });
        } else {
          toast.error('Error loading lists');
        }
        setLists([]);
      } else {
        setLists(data || []);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
      toast.error('Error loading lists');
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const createList = async () => {
    if (!newListName.trim()) {
      toast.error('Enter a name for the list');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('player_lists')
        .insert([{ 
          name: newListName,
          player_ids: []
        }])
        .select();

      if (error) {
        console.error('Errore dettagliato:', error);
        console.error('Messaggio errore:', error.message);
        console.error('Dettagli errore:', error.details);
        console.error('Hint errore:', error.hint);
        if (error.message.includes('relation "player_lists" does not exist')) {
          toast.error('⚠️ Table player_lists not found! Run the SQL migration first.');
        } else {
          toast.error(`Error: ${error.message || 'Unknown error'}`);
        }
        return;
      }
      
      setLists([data[0], ...lists]);
      setNewListName('');
      setShowNewListModal(false);
      toast.success('✅ List created successfully!');
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Error creating list');
    }
  };

  const deleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    try {
      const { error } = await supabase
        .from('player_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
      
      setLists(lists.filter(l => l.id !== listId));
      if (selectedList?.id === listId) setSelectedList(null);
      toast.success('List deleted');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Error deleting list');
    }
  };

  const updateListName = async (listId, newName) => {
    if (!newName.trim()) {
      toast.error('Enter a valid name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('player_lists')
        .update({ name: newName })
        .eq('id', listId)
        .select();

      if (error) throw error;

      const updatedList = data[0];
      setLists(lists.map(l => l.id === updatedList.id ? updatedList : l));
      if (selectedList?.id === listId) setSelectedList(updatedList);
      setEditingListId(null);
      setEditingListName('');
      toast.success('List name updated!');
    } catch (error) {
      console.error('Error updating list name:', error);
      toast.error('Error updating name');
    }
  };

  const addPlayerToList = async (playerId) => {
    if (!selectedList) return;

    const updatedPlayerIds = [...(selectedList.player_ids || []), playerId];

    try {
      const { data, error } = await supabase
        .from('player_lists')
        .update({ player_ids: updatedPlayerIds })
        .eq('id', selectedList.id)
        .select();

      if (error) throw error;

      const updatedList = data[0];
      setLists(lists.map(l => l.id === updatedList.id ? updatedList : l));
      setSelectedList(updatedList);
      toast.success('Player added to list!');
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error('Error adding player');
    }
  };

  const removePlayerFromList = async (playerId) => {
    if (!selectedList) return;

    const updatedPlayerIds = (selectedList.player_ids || []).filter(id => id !== playerId);

    try {
      const { data, error } = await supabase
        .from('player_lists')
        .update({ player_ids: updatedPlayerIds })
        .eq('id', selectedList.id)
        .select();

      if (error) throw error;

      const updatedList = data[0];
      setLists(lists.map(l => l.id === updatedList.id ? updatedList : l));
      setSelectedList(updatedList);
      toast.success('Player removed from list');
    } catch (error) {
      console.error('Error removing player:', error);
      toast.error('Error removing player');
    }
  };

  const getListPlayers = (list) => {
    if (!list?.player_ids) return [];
    return players.filter(p => list.player_ids.includes(p.id));
  };

  // Rimuovi duplicati basandosi sul nome (case-insensitive)
  // Mantiene il giocatore con l'ID più alto (più recente)
  const uniquePlayers = players.reduce((acc, player) => {
    const existingIndex = acc.findIndex(p => 
      p.name?.toLowerCase() === player.name?.toLowerCase()
    );
    
    if (existingIndex === -1) {
      // Giocatore non esiste ancora, aggiungilo
      acc.push(player);
    } else {
      // Giocatore esiste già, mantieni quello con ID più alto (più recente)
      if (player.id > acc[existingIndex].id) {
        acc[existingIndex] = player;
      }
    }
    return acc;
  }, []);

  const filteredPlayers = uniquePlayers.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedList?.player_ids?.includes(p.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📋 Liste Giocatori</h1>
        <button
          onClick={() => setShowNewListModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuova Lista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonna Liste */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Le Mie Liste</h2>
            
            {lists.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Nessuna lista creata</p>
                <p className="text-sm mt-2">Crea la tua prima lista!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lists.map(list => (
                  <div
                    key={list.id}
                    onClick={() => setSelectedList(list)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedList?.id === list.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {editingListId === list.id ? (
                          <input
                            type="text"
                            value={editingListName}
                            onChange={(e) => setEditingListName(e.target.value)}
                            onBlur={() => updateListName(list.id, editingListName)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') updateListName(list.id, editingListName);
                              if (e.key === 'Escape') {
                                setEditingListId(null);
                                setEditingListName('');
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold bg-white bg-opacity-20 px-2 py-1 rounded w-full text-white"
                            autoFocus
                          />
                        ) : (
                          <h3 
                            className="font-bold"
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingListId(list.id);
                              setEditingListName(list.name);
                            }}
                          >
                            {list.name}
                          </h3>
                        )}
                        <p className={`text-sm ${selectedList?.id === list.id ? 'text-white' : 'text-gray-600'}`}>
                          {list.player_ids?.length || 0} giocatori
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {selectedList?.id === list.id && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingListId(list.id);
                                setEditingListName(list.name);
                              }}
                              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                              title="Modifica nome"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {list.player_ids?.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewFormation(list);
                                }}
                                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                                title="Visualizza formazione"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteList(list.id);
                          }}
                          className={`p-2 rounded-lg transition-all ${
                            selectedList?.id === list.id
                              ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonna Giocatori nella Lista */}
        <div className="lg:col-span-2">
          {selectedList ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedList.name}
                </h2>
                <button
                  onClick={() => setShowAddPlayerModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Aggiungi Giocatore
                </button>
              </div>

              {getListPlayers(selectedList).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-semibold">Empty list</p>
                  <p className="text-sm mt-2">Aggiungi giocatori per iniziare</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getListPlayers(selectedList).map(player => (
                    <div
                      key={player.id}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-all"
                    >
                      {player.profile_image ? (
                        <img
                          src={player.profile_image}
                          alt={player.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                          {player.name?.[0] || '?'}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{player.name}</h3>
                        <p className="text-sm text-gray-600">{player.general_role || 'N/D'}</p>
                        <p className="text-xs text-gray-500">{player.team || 'N/D'}</p>
                      </div>
                      <button
                        onClick={() => removePlayerFromList(player.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-500">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-xl font-semibold">Seleziona una lista</p>
              <p className="text-sm mt-2">Scegli una lista dalla colonna di sinistra</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuova Lista */}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Crea Nuova Lista</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nome della lista..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createList()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewListModal(false);
                  setNewListName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Annulla
              </button>
              <button
                onClick={createList}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Crea Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aggiungi Giocatore */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aggiungi Giocatore</h2>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca giocatore..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {filteredPlayers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nessun giocatore disponibile</p>
              ) : (
                filteredPlayers.map(player => (
                  <div
                    key={player.id}
                    onClick={() => {
                      addPlayerToList(player.id);
                      setShowAddPlayerModal(false);
                      setSearchTerm('');
                    }}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
                  >
                    {player.profile_image ? (
                      <img
                        src={player.profile_image}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                        {player.name?.[0] || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{player.name}</h3>
                      <p className="text-sm text-gray-600">{player.general_role} • {player.team}</p>
                    </div>
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                setShowAddPlayerModal(false);
                setSearchTerm('');
              }}
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

export default PlayerLists;
