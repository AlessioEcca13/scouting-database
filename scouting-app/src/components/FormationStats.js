// src/components/FormationStats.js - Statistiche della formazione
import React from 'react';

function FormationStats({ players, assignedPlayers, formation }) {
  const currentYear = new Date().getFullYear();
  
  // Calcola statistiche
  const totalPlayers = players.length;
  const assignedCount = assignedPlayers.length;
  const unassignedCount = totalPlayers - assignedCount;
  
  // Età media
  const playersWithAge = assignedPlayers.filter(ap => ap.player.birth_year);
  const avgAge = playersWithAge.length > 0
    ? Math.round(playersWithAge.reduce((sum, ap) => sum + (currentYear - ap.player.birth_year), 0) / playersWithAge.length)
    : 0;
  
  // Conta per ruolo
  const roleCount = {
    GK: 0,
    DF: 0,
    MF: 0,
    FW: 0
  };
  
  assignedPlayers.forEach(ap => {
    const role = ap.player.general_role?.toUpperCase() || '';
    if (role.includes('PORT') || role === 'GK') roleCount.GK++;
    else if (role.includes('DIF') || role.includes('TERZINO') || role.includes('CENTRALE') || role === 'DF') roleCount.DF++;
    else if (role.includes('ATT') || role.includes('PUNTA') || role === 'FW' || role === 'ST') roleCount.FW++;
    else roleCount.MF++;
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Statistiche Formazione
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Modulo */}
        <div className="bg-white rounded-lg p-4 text-center shadow">
          <div className="text-3xl font-bold text-blue-600">{formation}</div>
          <div className="text-xs text-gray-600 mt-1">Formation</div>
        </div>
        
        {/* Giocatori Schierati */}
        <div className="bg-white rounded-lg p-4 text-center shadow">
          <div className="text-3xl font-bold text-green-600">{assignedCount}</div>
          <div className="text-xs text-gray-600 mt-1">Schierati</div>
        </div>
        
        {/* Giocatori Disponibili */}
        <div className="bg-white rounded-lg p-4 text-center shadow">
          <div className="text-3xl font-bold text-orange-600">{unassignedCount}</div>
          <div className="text-xs text-gray-600 mt-1">Disponibili</div>
        </div>
        
        {/* Età Media */}
        <div className="bg-white rounded-lg p-4 text-center shadow">
          <div className="text-3xl font-bold text-purple-600">{avgAge || '-'}</div>
          <div className="text-xs text-gray-600 mt-1">Età Media</div>
        </div>
      </div>
      
      {/* Distribuzione Ruoli */}
      <div className="mt-4 bg-white rounded-lg p-4 shadow">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribuzione Ruoli</h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{roleCount.GK}</div>
            <div className="text-xs text-gray-600">Portieri</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{roleCount.DF}</div>
            <div className="text-xs text-gray-600">Difensori</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{roleCount.MF}</div>
            <div className="text-xs text-gray-600">Centrocampisti</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{roleCount.FW}</div>
            <div className="text-xs text-gray-600">Attaccanti</div>
          </div>
        </div>
      </div>
      
      {/* Barra Completamento */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Completamento Formazione</span>
          <span>{Math.round((assignedCount / 11) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((assignedCount / 11) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default FormationStats;
