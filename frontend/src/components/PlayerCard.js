// src/components/PlayerCard.js
import React from 'react';

function PlayerCard({ player, onSelect, onDelete }) {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Alta': return 'bg-red-100 text-red-700 border-red-300';
      case 'Media': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Bassa': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getFeedbackColor = (feedback) => {
    switch(feedback) {
      case 'Mi piace': return 'bg-emerald-500';
      case 'Non mi piace': return 'bg-red-500';
      case 'Da valutare': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const currentYear = new Date().getFullYear();
  const age = player.birth_year ? currentYear - player.birth_year : 'N/D';

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all cursor-pointer"
      onClick={() => onSelect(player)}
    >
      <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{player.name || 'Nome non disponibile'}</h3>
            <p className="text-sm text-gray-600">{player.nationality || 'Nazionalità N/D'}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(player.priority)}`}>
            {player.priority || 'N/A'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Squadra:</span>
            <span className="font-medium">{player.team || 'N/D'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ruolo:</span>
            <span className="font-medium">{player.general_role || 'N/D'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Età:</span>
            <span className="font-medium">{age} anni</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Piede:</span>
            <span className="font-medium">{player.preferred_foot || 'N/D'}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Attuale</p>
              <div className="text-yellow-500">
                {'★'.repeat(player.current_value || 0)}{'☆'.repeat(5-(player.current_value || 0))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Potenziale</p>
              <div className="text-emerald-500">
                {'★'.repeat(player.potential_value || 0)}{'☆'.repeat(5-(player.potential_value || 0))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getFeedbackColor(player.director_feedback)}`}></div>
              <span className="text-xs text-gray-600">{player.director_feedback || 'N/D'}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;