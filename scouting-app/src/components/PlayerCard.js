// src/components/PlayerCard.js
import React from 'react';

function PlayerCard({ player, onSelect, onDelete, onAddReport, isSignalazione = false }) {
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
      className={`bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all cursor-pointer ${
        isSignalazione ? 'border-2 border-orange-300' : ''
      }`}
      onClick={() => {
        if (isSignalazione && onAddReport) {
          onAddReport(player);
        } else {
          onSelect(player);
        }
      }}
    >
      <div className={`h-2 ${isSignalazione ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}></div>
      
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1">
            {/* Immagine Giocatore */}
            {player.profile_image ? (
              <img 
                src={player.profile_image} 
                alt={player.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-purple-200 shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/80/9333ea/ffffff?text=' + (player.name?.[0] || '?');
                }}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl border-2 border-purple-200 shadow-md">
                {player.name?.[0] || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">{player.name || 'Nome non disponibile'}</h3>
                {isSignalazione && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300 animate-pulse whitespace-nowrap">
                    ⚠️ DA VALUTARE
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{player.nationality || 'Nazionalità N/D'}</p>
              {player.priority && (
                <span className={`inline-block mt-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold border-2 ${getPriorityColor(player.priority)} shadow-sm`}>
                  {player.priority === 'Alta' && '🔴 '}
                  {player.priority === 'Media' && '🟡 '}
                  {player.priority === 'Bassa' && '🟢 '}
                  {player.priority}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="text-gray-600">Squadra:</span>
            <span className="font-medium truncate">{player.team || 'N/D'}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="text-gray-600">Ruolo:</span>
            <span className="font-medium truncate">{player.general_role || 'N/D'}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="text-gray-600">Età:</span>
            <span className="font-medium">{age} anni</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="text-gray-600">Piede:</span>
            <span className="font-medium truncate">{player.preferred_foot || 'N/D'}</span>
          </div>
        </div>

        <div className="border-t pt-3 sm:pt-4">
          {/* Valutazioni - Solo se il giocatore è stato valutato */}
          {player.is_scouted && (player.current_value || player.potential_value) && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
              {player.current_value && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Attuale</p>
                  <div className="text-yellow-500 text-sm sm:text-base">
                    {'★'.repeat(player.current_value)}{'☆'.repeat(5-player.current_value)}
                  </div>
                </div>
              )}
              {player.potential_value && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Potenziale</p>
                  <div className="text-emerald-500 text-sm sm:text-base">
                    {'★'.repeat(player.potential_value)}{'☆'.repeat(5-player.potential_value)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottone Compila Report - Solo per Segnalazioni */}
          {isSignalazione && onAddReport && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddReport(player);
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 sm:py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 mb-2 sm:mb-3 shadow-lg transform hover:scale-105 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              📝 COMPILA REPORT
            </button>
          )}

          <div className="flex justify-between items-center pt-2 sm:pt-3 border-t">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className={`w-2 h-2 rounded-full ${getFeedbackColor(player.director_feedback)}`}></div>
              <span className="text-xs text-gray-600 truncate">{player.director_feedback || 'N/D'}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-500 hover:text-red-700 transition-colors p-1"
            >
              <i className="fas fa-trash text-xs sm:text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;