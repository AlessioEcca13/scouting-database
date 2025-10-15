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
      className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all cursor-pointer border-l-4 border-blue-500"
      onClick={() => onSelect(player)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{player.name || 'Nome non disponibile'}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <span className="mr-2">{player.nationality || 'Nazionalità N/D'}</span>
              {player.nationality && <span className="text-xs">{player.nationality.split(' ')[0]}</span>}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(player.priority)}`}>
            {player.priority || 'N/A'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Squadra:</span>
            <span className="font-medium text-gray-800">{player.team || 'N/D'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ruolo:</span>
            <span className="font-medium text-blue-600">{player.general_role || 'N/D'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Età:</span>
            <span className="font-medium text-gray-800">{age} anni</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Piede:</span>
            <span className="font-medium text-gray-800">{player.preferred_foot || 'N/D'}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1 font-medium">Attuale</p>
              <div className="text-yellow-500 text-lg">
                {'★'.repeat(player.current_value || 0)}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1 font-medium">Potenziale</p>
              <div className="text-green-500 text-lg">
                {'★'.repeat(player.potential_value || 0)}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getFeedbackColor(player.director_feedback)}`}></div>
              <span className="text-xs text-gray-600 font-medium">{player.director_feedback || 'Da valutare'}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-500 hover:text-red-700 transition-colors p-1"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;