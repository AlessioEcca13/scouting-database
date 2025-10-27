// src/components/PlayerCompactCard.js
import React from 'react';

function PlayerCompactCard({ player, onClick }) {
  const currentYear = new Date().getFullYear();
  const age = player.birth_year ? currentYear - player.birth_year : null;

  const getRoleColor = (role) => {
    const colors = {
      'Goalkeeper': 'bg-yellow-500',
      'Defender': 'bg-blue-500',
      'Terzino': 'bg-blue-400',
      'Centrocampo': 'bg-green-500',
      'Ala': 'bg-purple-500',
      'Forward': 'bg-red-500'
    };
    return colors[role] || 'bg-gray-500';
  };


  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-400 overflow-hidden group"
    >
      <div className="flex">
        {/* Immagine */}
        <div className="w-32 h-40 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {player.profile_image ? (
            <img
              src={player.profile_image}
              alt={player.name}
              className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center" style={{ display: player.profile_image ? 'none' : 'flex' }}>
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          {/* Badge ruolo */}
          <div className={`absolute bottom-0 left-0 right-0 ${getRoleColor(player.general_role)} text-white text-xs font-bold py-1 text-center`}>
            {player.general_role}
          </div>
        </div>

        {/* Contenuto */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                {player.name}
              </h3>
              <p className="text-sm text-gray-600">{player.team || 'Senza squadra'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
            <div>
              <span className="font-semibold">Età:</span> {age || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Naz:</span> {player.nationality || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Piede:</span> {player.preferred_foot || 'N/A'}
            </div>
          </div>

          {/* Valutazioni */}
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Valore:</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${i < (player.current_value || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Potenziale:</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${i < (player.potential_value || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {/* Valore di mercato */}
          {(player.market_value_numeric || player.market_value) && (
            <div className="mt-2 text-xs">
              <span className="font-semibold text-green-600">
                💰 {player.market_value_numeric ? `€${player.market_value_numeric}M` : player.market_value}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer con azione rapida */}
      <div className="bg-gray-50 px-4 py-2 flex justify-between items-center text-xs text-gray-600 border-t">
        <span>{player.specific_position || player.general_role}</span>
        <span className="text-blue-600 font-semibold group-hover:underline">
          Vedi dettagli →
        </span>
      </div>
    </div>
  );
}

export default PlayerCompactCard;
