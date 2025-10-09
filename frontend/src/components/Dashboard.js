// src/components/Dashboard.js
import React from 'react';

function Dashboard({ players, onSelectPlayer }) {
  // Calcola statistiche
  const stats = {
    totalPlayers: players.length,
    avgPotential: players.length > 0 
      ? (players.reduce((acc, p) => acc + (p.potential_value || 0), 0) / players.length).toFixed(1)
      : 0,
    highPotential: players.filter(p => (p.potential_value || 0) >= 4).length,
    positions: {
      'Portiere': players.filter(p => p.general_role === 'Portiere').length,
      'Difensore': players.filter(p => p.general_role === 'Difensore').length,
      'Centrocampo': players.filter(p => p.general_role === 'Centrocampo').length,
      'Attaccante': players.filter(p => p.general_role === 'Attaccante').length,
      'Terzino': players.filter(p => p.general_role === 'Terzino').length,
      'Ala': players.filter(p => p.general_role === 'Ala').length
    }
  };

  // Ultimi giocatori aggiunti
  const recentPlayers = [...players]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  // Giocatori con priorità alta
  const highPriorityPlayers = players
    .filter(p => p.priority === 'Alta')
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-2 text-gradient">Dashboard Overview</h2>
        <p className="text-gray-600">Panoramica completa del database scouting</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform">
          <i className="fas fa-users text-3xl mb-2 opacity-80"></i>
          <div className="text-3xl font-bold">{stats.totalPlayers}</div>
          <div className="text-sm opacity-90">Totale Giocatori</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform">
          <i className="fas fa-star text-3xl mb-2 opacity-80"></i>
          <div className="text-3xl font-bold">{stats.avgPotential}</div>
          <div className="text-sm opacity-90">Media Potenziale</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform">
          <i className="fas fa-gem text-3xl mb-2 opacity-80"></i>
          <div className="text-3xl font-bold">{stats.highPotential}</div>
          <div className="text-sm opacity-90">Alto Potenziale (4+)</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform">
          <i className="fas fa-chart-line text-3xl mb-2 opacity-80"></i>
          <div className="text-3xl font-bold">{highPriorityPlayers.length}</div>
          <div className="text-sm opacity-90">Priorità Alta</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuzione Ruoli */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            <i className="fas fa-chart-pie mr-2 text-purple-500"></i>
            Distribuzione per Ruolo
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.positions).map(([role, count]) => (
              <div key={role} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-600">{role}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                    style={{width: players.length > 0 ? `${(count / players.length) * 100}%` : '0%'}}
                  >
                    <span className="text-white text-xs font-bold">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Giocatori Prioritari */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            <i className="fas fa-exclamation-circle mr-2 text-red-500"></i>
            Giocatori Priorità Alta
          </h3>
          {highPriorityPlayers.length > 0 ? (
            <div className="space-y-2">
              {highPriorityPlayers.map(player => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                  onClick={() => onSelectPlayer(player)}
                >
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.team} • {player.general_role}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">
                      {'★'.repeat(player.potential_value || 0)}
                    </span>
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      Urgente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nessun giocatore con priorità alta</p>
          )}
        </div>
      </div>

      {/* Ultimi Giocatori Aggiunti */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          <i className="fas fa-clock mr-2 text-blue-500"></i>
          Ultimi Giocatori Aggiunti
        </h3>
        {recentPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPlayers.map(player => (
              <div 
                key={player.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer transform hover:scale-105"
                onClick={() => onSelectPlayer(player)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{player.name}</h4>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {player.general_role}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{player.team}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {'⭐'.repeat(player.potential_value || 0)}
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
  );
}

export default Dashboard;