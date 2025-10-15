// src/components/Dashboard.js
import React from 'react';

function Dashboard({ players, onSelectPlayer }) {
  // Separa giocatori valutati e segnalazioni
  const scoutedPlayers = players.filter(p => p.is_scouted !== false);
  const signalazioni = players.filter(p => p.is_scouted === false);
  
  // Calcola statistiche
  const stats = {
    totalPlayers: scoutedPlayers.length,
    totalSignalazioni: signalazioni.length,
    avgPotential: scoutedPlayers.length > 0 
      ? (scoutedPlayers.reduce((acc, p) => acc + (p.potential_value || 0), 0) / scoutedPlayers.length).toFixed(1)
      : 0,
    highPotential: scoutedPlayers.filter(p => (p.potential_value || 0) >= 4).length,
    positions: {
      'Portiere': scoutedPlayers.filter(p => p.general_role === 'Portiere').length,
      'Difensore': scoutedPlayers.filter(p => p.general_role === 'Difensore').length,
      'Centrocampo': scoutedPlayers.filter(p => p.general_role === 'Centrocampo').length,
      'Attaccante': scoutedPlayers.filter(p => p.general_role === 'Attaccante').length,
      'Terzino': scoutedPlayers.filter(p => p.general_role === 'Terzino').length,
      'Ala': scoutedPlayers.filter(p => p.general_role === 'Ala').length
    }
  };

  // Ultimi giocatori aggiunti (solo valutati)
  const recentPlayers = [...scoutedPlayers]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  // Giocatori con priorità alta
  const highPriorityPlayers = scoutedPlayers
    .filter(p => p.priority === 'Alta')
    .slice(0, 5);
  
  // Ultime segnalazioni da valutare
  const recentSignalazioni = [...signalazioni]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header con Logo Prominente */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-12 shadow-2xl border border-slate-700 flex items-center justify-center">
        {/* Logo Centrale Grande */}
        <div className="relative">
          <img 
            src="/logo-lamecca-dark.png" 
            alt="La M.E.cca - Database Scouting" 
            className="h-40 w-auto object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-300"
            style={{ filter: 'drop-shadow(0 0 30px rgba(34, 197, 94, 0.5))' }}
            onError={(e) => {
              console.error('Logo dark non trovato, usando fallback');
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback icon */}
          <div 
            className="h-40 w-40 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-6xl shadow-xl"
            style={{ display: 'none' }}
          >
            👁️
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform shadow-lg">
          <i className="fas fa-users text-3xl mb-2 opacity-80"></i>
          <div className="text-3xl font-bold">{stats.totalPlayers}</div>
          <div className="text-sm opacity-90">Giocatori Valutati</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white transform hover:scale-105 transition-transform shadow-lg">
          <i className="fas fa-bell text-3xl mb-2 opacity-80"></i>
          <div className="text-3xl font-bold">{stats.totalSignalazioni}</div>
          <div className="text-sm opacity-90">Segnalazioni da Valutare</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform shadow-lg">
          <i className="fas fa-star text-3xl mb-2 opacity-80"></i>
          <div className="text-3xl font-bold">{stats.avgPotential}</div>
          <div className="text-sm opacity-90">Media Potenziale</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white transform hover:scale-105 transition-transform shadow-lg">
          <i className="fas fa-gem text-3xl mb-2 opacity-80"></i>
          <div className="text-3xl font-bold">{stats.highPotential}</div>
          <div className="text-sm opacity-90">Alto Potenziale (4+)</div>
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

      {/* Segnalazioni da Valutare */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-yellow-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            <i className="fas fa-bell mr-2 text-orange-500"></i>
            📌 Segnalazioni da Valutare
          </h3>
          {stats.totalSignalazioni > 0 && (
            <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full animate-pulse">
              {stats.totalSignalazioni} in attesa
            </span>
          )}
        </div>
        {recentSignalazioni.length > 0 ? (
          <div className="space-y-2">
            {recentSignalazioni.map(player => (
              <div 
                key={player.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md cursor-pointer transition-all border-l-4 border-orange-400"
                onClick={() => onSelectPlayer(player)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Immagine */}
                  {player.profile_image ? (
                    <img 
                      src={player.profile_image} 
                      alt={player.name}
                      className="w-12 h-12 rounded-lg object-cover object-top border-2 border-orange-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center text-white font-bold text-lg border-2 border-orange-300"
                    style={{ display: player.profile_image ? 'none' : 'flex' }}
                  >
                    {player.name?.[0] || '?'}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-600">
                      {player.team || 'N/D'} • {player.general_role} • {player.nationality || 'N/D'}
                    </div>
                  </div>
                </div>
                
                {/* Badge e Data */}
                <div className="flex items-center gap-3">
                  {player.signaler_name && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Segnalato da: {player.signaler_name}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(player.created_at).toLocaleDateString('it-IT')}
                  </span>
                  <i className="fas fa-chevron-right text-orange-400"></i>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-check-circle text-4xl text-green-500 mb-2"></i>
            <p>Nessuna segnalazione in attesa! Ottimo lavoro! 🎉</p>
          </div>
        )}
      </div>

      {/* Ultimi Giocatori Aggiunti */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          <i className="fas fa-clock mr-2 text-blue-500"></i>
          Ultimi Giocatori Valutati
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