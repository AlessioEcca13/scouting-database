// src/components/Database.js
import React, { useState, useMemo } from 'react';
import PlayerCard from './PlayerCard';
import PlayerTable from './PlayerTable';

function Database({ players, onSelectPlayer, onDeletePlayer, onAddReport, loading, onRefresh, title = "🗄️ Database Giocatori", emptyMessage = "No players found", isSignalazione = false }) {
  const [viewMode, setViewMode] = useState('cards'); // cards, table, compact
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Stati per i filtri
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    minPotential: '',
    maxAge: '',
    nationality: '',
    foot: '',
    team: '',
    priority: ''
  });

  // Filtra e ordina giocatori
  const filteredPlayers = useMemo(() => {
    let result = [...players];

    // Applica filtri
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.team?.toLowerCase().includes(searchLower) ||
        p.nationality?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.role) {
      result = result.filter(p => p.general_role === filters.role);
    }

    if (filters.minPotential) {
      result = result.filter(p => (p.potential_value || 0) >= parseInt(filters.minPotential));
    }

    if (filters.maxAge) {
      const currentYear = new Date().getFullYear();
      result = result.filter(p => {
        const age = p.birth_year ? currentYear - p.birth_year : 0;
        return age <= parseInt(filters.maxAge);
      });
    }

    if (filters.nationality) {
      result = result.filter(p => p.nationality?.includes(filters.nationality));
    }

    if (filters.foot) {
      result = result.filter(p => p.preferred_foot === filters.foot);
    }

    if (filters.team) {
      result = result.filter(p => p.team?.toLowerCase().includes(filters.team.toLowerCase()));
    }

    if (filters.priority) {
      result = result.filter(p => p.priority === filters.priority);
    }

    // Ordina
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Gestisci valori null/undefined
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      // Converti in stringa per confronto
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [players, filters, sortBy, sortOrder]);

  // Reset filtri
  const resetFilters = () => {
    setFilters({
      search: '',
      role: '',
      minPotential: '',
      maxAge: '',
      nationality: '',
      foot: '',
      team: '',
      priority: ''
    });
  };

  // Conta filtri attivi
  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  // Componente Lista Compatta
  function CompactList({ players }) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 space-y-2">
        {players.map(player => (
          <div 
            key={player.id} 
            className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            onClick={() => onSelectPlayer(player)}
          >
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                {player.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base truncate">{player.name}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">
                  {player.team} • {player.general_role} • {new Date().getFullYear() - (player.birth_year || 2000)} anni
                </div>
              </div>
              <div className="text-yellow-500 text-sm sm:text-base hidden sm:block">
                {'★'.repeat(player.potential_value || 0)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePlayer(player.id);
                }}
                className="text-red-500 hover:text-red-700 ml-2 sm:ml-4 p-1 flex-shrink-0"
              >
                <i className="fas fa-times text-sm sm:text-base"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-500 mb-4"></i>
          <p className="text-gray-600">Caricamento giocatori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Header e Controlli */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gradient">{title}</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Toggle Filtri */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                showFilters ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
              } hover:opacity-80 flex-1 sm:flex-none`}
            >
              <i className="fas fa-filter mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Filtri</span>
              <span className="sm:hidden">Filtri</span>
              {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </button>

            {/* Bottone Refresh */}
            <button
              onClick={onRefresh}
              className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
            >
              <i className="fas fa-sync mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Aggiorna</span>
            </button>

            {/* Switch Vista - Nascosto su mobile piccolo */}
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded transition-colors ${
                  viewMode === 'cards' ? 'bg-white shadow text-purple-600' : 'text-gray-600'
                }`}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow text-purple-600' : 'text-gray-600'
                }`}
              >
                <i className="fas fa-table"></i>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 rounded transition-colors ${
                  viewMode === 'compact' ? 'bg-white shadow text-purple-600' : 'text-gray-600'
                }`}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Pannello Filtri */}
        {showFilters && (
          <div className="border-t pt-4 mt-4 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Ricerca */}
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Cerca nome, squadra..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>

              {/* Ruolo */}
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              >
                <option value="">All Positions</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Terzino">Terzino</option>
                <option value="Centrocampo">Centrocampo</option>
                <option value="Ala">Ala</option>
                <option value="Forward">Forward</option>
              </select>

              {/* Potenziale Minimo */}
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.minPotential}
                onChange={(e) => setFilters({...filters, minPotential: e.target.value})}
              >
                <option value="">Potenziale...</option>
                <option value="2">≥ 2 ⭐</option>
                <option value="3">≥ 3 ⭐</option>
                <option value="4">≥ 4 ⭐</option>
                <option value="5">5 ⭐</option>
              </select>

              {/* Età Massima */}
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.maxAge}
                onChange={(e) => setFilters({...filters, maxAge: e.target.value})}
              >
                <option value="">Età max...</option>
                <option value="21">≤ 21 anni</option>
                <option value="23">≤ 23 anni</option>
                <option value="25">≤ 25 anni</option>
                <option value="30">≤ 30 anni</option>
              </select>

              {/* Piede */}
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.foot}
                onChange={(e) => setFilters({...filters, foot: e.target.value})}
              >
                <option value="">Piede...</option>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both</option>
              </select>

              {/* Priorità */}
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                <option value="">Priorità...</option>
                <option value="Alta">🔴 Alta</option>
                <option value="Media">🟡 Media</option>
                <option value="Bassa">🟢 Bassa</option>
              </select>

              {/* Squadra */}
              <input
                type="text"
                placeholder="Squadra..."
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.team}
                onChange={(e) => setFilters({...filters, team: e.target.value})}
              />

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <i className="fas fa-times mr-2"></i>
                Reset Filtri
              </button>
            </div>

            {/* Filtri Attivi */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => 
                  value && (
                    <span 
                      key={key} 
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center"
                    >
                      {key}: {value}
                      <button
                        onClick={() => setFilters({...filters, [key]: ''})}
                        className="ml-2 hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Risultati e Ordinamento */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-gray-600">
            Trovati <strong>{filteredPlayers.length}</strong> giocatori su {players.length}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Ordina per:</span>
            <select
              className="px-3 py-1 border rounded-lg text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="birth_year">Anno nascita</option>
              <option value="potential_value">Potential</option>
              <option value="team">Club</option>
              <option value="created_at">Date Added</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 border rounded-lg hover:bg-gray-50"
            >
              <i className={`fas fa-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Vista Giocatori */}
      <div>
        {filteredPlayers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-600">{emptyMessage}</p>
            {players.length > 0 && <p className="text-gray-500 mt-2">Prova a modificare i filtri</p>}
          </div>
        ) : (
          <>
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map(player => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    onSelect={() => onSelectPlayer(player)}
                    onDelete={() => onDeletePlayer(player.id)}
                    onAddReport={onAddReport}
                    isSignalazione={isSignalazione}
                  />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <PlayerTable 
                players={filteredPlayers}
                onSelect={onSelectPlayer}
                onDelete={onDeletePlayer}
                onAddReport={onAddReport}
              />
            )}

            {viewMode === 'compact' && (
              <CompactList players={filteredPlayers} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Database;