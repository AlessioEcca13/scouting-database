// src/components/Reports.js
import React, { useMemo } from 'react';

function Reports({ players }) {
  // Calcola statistiche avanzate
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    return {
      total: players.length,
      avgAge: players.length > 0 
        ? (players.reduce((acc, p) => acc + (p.birth_year ? currentYear - p.birth_year : 0), 0) / players.length).toFixed(1)
        : 0,
      avgPotential: players.length > 0 
        ? (players.reduce((acc, p) => acc + (p.potential_value || 0), 0) / players.length).toFixed(2)
        : 0,
      avgCurrent: players.length > 0 
        ? (players.reduce((acc, p) => acc + (p.current_value || 0), 0) / players.length).toFixed(2)
        : 0,
      
      // Per priorità
      highPriority: players.filter(p => p.priority === 'Alta').length,
      mediumPriority: players.filter(p => p.priority === 'Media').length,
      lowPriority: players.filter(p => p.priority === 'Bassa').length,
      
      // Per feedback
      positive: players.filter(p => p.director_feedback === 'Mi piace').length,
      neutral: players.filter(p => p.director_feedback === 'Da valutare').length,
      negative: players.filter(p => p.director_feedback === 'Non mi piace').length,
      
      // Per ruolo
      byRole: {
        'Portiere': players.filter(p => p.general_role === 'Portiere').length,
        'Difensore': players.filter(p => p.general_role === 'Difensore').length,
        'Terzino': players.filter(p => p.general_role === 'Terzino').length,
        'Centrocampo': players.filter(p => p.general_role === 'Centrocampo').length,
        'Ala': players.filter(p => p.general_role === 'Ala').length,
        'Attaccante': players.filter(p => p.general_role === 'Attaccante').length
      },
      
      // Per piede
      byFoot: {
        'Destro': players.filter(p => p.preferred_foot === 'Destro').length,
        'Sinistro': players.filter(p => p.preferred_foot === 'Sinistro').length,
        'Ambidestro': players.filter(p => p.preferred_foot === 'Ambidestro').length
      },
      
      // Top performers
      topPotential: [...players]
        .filter(p => p.potential_value)
        .sort((a, b) => b.potential_value - a.potential_value)
        .slice(0, 5),
      
      // Giovani talenti (under 23 con alto potenziale)
      youngTalents: players.filter(p => {
        const age = p.birth_year ? currentYear - p.birth_year : 100;
        return age <= 23 && (p.potential_value || 0) >= 4;
      }),
      
      // Giocatori da monitorare
      toWatch: players.filter(p => 
        p.priority === 'Alta' || p.director_feedback === 'Mi piace'
      )
    };
  }, [players]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">
          Report e Statistiche
        </h2>
        <p className="text-gray-600">Analisi completa del database scouting</p>
      </div>

      {/* Statistiche Generali */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Totale Giocatori"
          value={stats.total}
          icon="fas fa-users"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Età Media"
          value={`${stats.avgAge} anni`}
          icon="fas fa-calendar"
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Potenziale Medio"
          value={`${stats.avgPotential} ⭐`}
          icon="fas fa-star"
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Valore Attuale Medio"
          value={`${stats.avgCurrent} ⭐`}
          icon="fas fa-trophy"
          color="from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuzione Priorità */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            <i className="fas fa-exclamation-triangle mr-2 text-red-500"></i>
            Distribuzione per Priorità
          </h3>
          <div className="space-y-4">
            <PriorityBar
              label="Alta Priorità"
              count={stats.highPriority}
              total={stats.total}
              color="red"
            />
            <PriorityBar
              label="Media Priorità"
              count={stats.mediumPriority}
              total={stats.total}
              color="yellow"
            />
            <PriorityBar
              label="Bassa Priorità"
              count={stats.lowPriority}
              total={stats.total}
              color="green"
            />
          </div>
        </div>

        {/* Feedback Direttore */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            <i className="fas fa-thumbs-up mr-2 text-blue-500"></i>
            Feedback Direttore
          </h3>
          <div className="space-y-4">
            <FeedbackBar
              label="Mi piace"
              count={stats.positive}
              total={stats.total}
              color="green"
              icon="👍"
            />
            <FeedbackBar
              label="Da valutare"
              count={stats.neutral}
              total={stats.total}
              color="yellow"
              icon="🤔"
            />
            <FeedbackBar
              label="Non mi piace"
              count={stats.negative}
              total={stats.total}
              color="red"
              icon="👎"
            />
          </div>
        </div>

        {/* Distribuzione Ruoli */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            <i className="fas fa-running mr-2 text-purple-500"></i>
            Distribuzione per Ruolo
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byRole).map(([role, count]) => (
              <RoleBar
                key={role}
                label={role}
                count={count}
                total={stats.total}
              />
            ))}
          </div>
        </div>

        {/* Distribuzione Piede */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            <i className="fas fa-shoe-prints mr-2 text-green-500"></i>
            Distribuzione per Piede
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.byFoot).map(([foot, count]) => (
              <FootBar
                key={foot}
                label={foot}
                count={count}
                total={stats.total}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top Giocatori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 per Potenziale */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-600">
            Top 5 per Potenziale
          </h3>
          {stats.topPotential.length > 0 ? (
            <div className="space-y-3">
              {stats.topPotential.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{player.name}</p>
                      <p className="text-sm text-gray-600">{player.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-500 text-lg mb-1">
                      {'★'.repeat(player.potential_value)}
                    </div>
                    <span className="text-xs text-gray-500">{player.general_role}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nessun giocatore disponibile</p>
          )}
        </div>

        {/* Azioni Consigliate */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-600">
            Azioni Consigliate
          </h3>
          <div className="space-y-4">
            {/* Acquistare */}
            {players.filter(p => p.recommended_action === 'Acquistare').slice(0, 2).map(player => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div>
                  <p className="font-semibold text-gray-800">{player.name}</p>
                  <p className="text-sm text-gray-600">{player.team}</p>
                </div>
                <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                  Acquistare
                </span>
              </div>
            ))}
            
            {/* Trattare */}
            {players.filter(p => p.recommended_action === 'Trattare').slice(0, 2).map(player => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div>
                  <p className="font-semibold text-gray-800">{player.name}</p>
                  <p className="text-sm text-gray-600">{player.team}</p>
                </div>
                <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                  Trattare
                </span>
              </div>
            ))}
            
            {(players.filter(p => p.recommended_action === 'Acquistare').length === 0 && 
              players.filter(p => p.recommended_action === 'Trattare').length === 0) && (
              <p className="text-gray-500 text-center py-8">Nessuna azione consigliata</p>
            )}
          </div>
        </div>
      </div>

      {/* Giocatori da Monitorare */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 shadow-lg border-l-4 border-red-500">
        <h3 className="text-lg font-semibold mb-4">
          <i className="fas fa-eye mr-2 text-red-600"></i>
          Giocatori da Monitorare ({stats.toWatch.length})
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Giocatori con priorità alta o feedback positivo dal direttore
        </p>
        {stats.toWatch.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.toWatch.map(player => (
              <div key={player.id} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-xs text-gray-600">{player.team}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    player.priority === 'Alta' ? 'bg-red-100 text-red-700' :
                    player.director_feedback === 'Mi piace' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {player.priority === 'Alta' ? '🔴 Urgente' : '✅ Consigliato'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">{player.general_role}</span>
                  <span className="text-emerald-500">
                    {'★'.repeat(player.potential_value || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Nessun giocatore da monitorare</p>
        )}
      </div>
    </div>
  );
}

// Componenti helper
function StatCard({ title, value, icon, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white transform hover:scale-105 transition-transform shadow-lg`}>
      <i className={`${icon} text-3xl mb-2 opacity-80`}></i>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-90">{title}</div>
    </div>
  );
}

function PriorityBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2`}
          style={{ width: `${percentage}%` }}
        >
          <span className="text-white text-xs font-bold">{count}</span>
        </div>
      </div>
    </div>
  );
}

function FeedbackBar({ label, count, total, color, icon }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{icon} {label}</span>
        <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2`}
          style={{ width: `${percentage}%` }}
        >
          <span className="text-white text-xs font-bold">{count}</span>
        </div>
      </div>
    </div>
  );
}

function RoleBar({ label, count, total }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function FootBar({ label, count, total }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
          style={{ width: `${percentage}%` }}
        >
          <span className="text-white text-xs font-bold">{count}</span>
        </div>
      </div>
    </div>
  );
}

export default Reports;