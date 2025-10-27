// src/components/PlayerTable.js
import React from 'react';

function PlayerTable({ players, onSelect, onDelete, onAddReport }) {

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold w-20">Foto</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Club</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Position</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nationality</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Potential</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Priorità</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {players.map((player, index) => (
              <tr 
                key={player.id} 
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
                onClick={() => onSelect(player)}
              >
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    {player.profile_image ? (
                      <img 
                        src={player.profile_image} 
                        alt={player.name}
                        className="w-12 h-12 rounded-lg object-cover object-top border-2 border-purple-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-purple-200"
                      style={{ display: player.profile_image ? 'none' : 'flex' }}
                    >
                      {player.name?.[0] || '?'}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{player.name}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {player.birth_year ? new Date().getFullYear() - player.birth_year : 'N/A'}
                </td>
                <td className="px-4 py-3 text-gray-600">{player.team || 'N/A'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {player.general_role || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{player.nationality || 'N/A'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="text-yellow-500">
                      {'★'.repeat(player.potential_value || 0)}
                    </span>
                    <span className="ml-1 text-gray-400">
                      {'☆'.repeat(5 - (player.potential_value || 0))}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {player.priority === 'Alta' && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      🔴 Alta
                    </span>
                  )}
                  {player.priority === 'Media' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      🟡 Media
                    </span>
                  )}
                  {player.priority === 'Bassa' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      🟢 Bassa
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {/* Bottone Compila Report */}
                    {onAddReport && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddReport(player);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Compila Report"
                      >
                        <i className="fas fa-file-alt"></i>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(player);
                      }}
                      title="Visualizza dettagli"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(player.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {players.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">No players found</p>
        </div>
      )}
    </div>
  );
}

export default PlayerTable;
