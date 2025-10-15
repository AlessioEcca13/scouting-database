// src/components/PlayerDetailModal.js
import React, { useState } from 'react';

function PlayerDetailModal({ player, onClose, onDelete }) {
  const [activeTab, setActiveTab] = useState('info');
  
  if (!player) return null;

  const currentYear = new Date().getFullYear();
  const age = player.birth_year ? currentYear - player.birth_year : 'N/D';

  const tabs = [
    { id: 'info', label: 'Informazioni', icon: 'fas fa-info-circle' },
    { id: 'skills', label: 'Caratteristiche', icon: 'fas fa-star' },
    { id: 'evaluation', label: 'Valutazioni', icon: 'fas fa-chart-line' },
    { id: 'notes', label: 'Note', icon: 'fas fa-sticky-note' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
              {player.name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{player.name || 'Nome non disponibile'}</h2>
              <p className="text-sm opacity-90">
                {player.team || 'Squadra N/D'} • {player.general_role || 'Ruolo N/D'} • {age} anni
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex space-x-1 p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white shadow text-purple-600 font-semibold'
                    : 'text-gray-600 hover:bg-white hover:bg-opacity-50'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Tab: Informazioni */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Nome Completo" value={player.name} />
                <InfoItem label="Anno di Nascita" value={player.birth_year} />
                <InfoItem label="Età" value={`${age} anni`} />
                <InfoItem label="Nazionalità" value={player.nationality} />
                <InfoItem label="Squadra" value={player.team} />
                <InfoItem label="Ruolo" value={player.general_role} />
                <InfoItem label="Posizione Specifica" value={player.specific_position} />
                <InfoItem label="Piede Preferito" value={player.preferred_foot} />
                <InfoItem label="Altezza" value={player.height ? `${player.height} cm` : 'N/D'} />
                <InfoItem label="Peso" value={player.weight ? `${player.weight} kg` : 'N/D'} />
              </div>

              {player.transfermarket_link && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    <i className="fas fa-link mr-2"></i>Collegamenti
                  </h4>
                  <div className="space-y-2">
                    <a
                      href={player.transfermarket_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <i className="fas fa-external-link-alt mr-2"></i>
                      Transfermarkt
                    </a>
                    {player.youtube_link && (
                      <a
                        href={player.youtube_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-red-600 hover:underline"
                      >
                        <i className="fab fa-youtube mr-2"></i>
                        Video Highlights
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Caratteristiche */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <SkillSection
                title="Stile di Gioco"
                icon="fas fa-running"
                content={player.play_style}
              />
              
              <SkillSection
                title="Funzioni/Etichette"
                icon="fas fa-tags"
                content={player.functions_labels}
              />
              
              <SkillSection
                title="Abilità Atletiche"
                icon="fas fa-dumbbell"
                content={player.athletic_skills}
                color="red"
              />
              
              <SkillSection
                title="Abilità Tecniche"
                icon="fas fa-magic"
                content={player.technical_skills}
                color="blue"
              />
              
              <SkillSection
                title="Abilità Tattiche"
                icon="fas fa-chess"
                content={player.tactical_skills}
                color="purple"
              />
            </div>
          )}

          {/* Tab: Valutazioni */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Valore Attuale</p>
                  <div className="text-3xl text-yellow-500">
                    {'★'.repeat(player.current_value || 0)}
                    {'☆'.repeat(5 - (player.current_value || 0))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{player.current_value}/5</p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Potenziale</p>
                  <div className="text-3xl text-emerald-500">
                    {'★'.repeat(player.potential_value || 0)}
                    {'☆'.repeat(5 - (player.potential_value || 0))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{player.potential_value}/5</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoItem 
                  label="Valore di Mercato" 
                  value={player.market_value || 'N/D'} 
                  highlight
                />
                <InfoItem 
                  label="Scadenza Contratto" 
                  value={player.contract_expiry || 'N/D'} 
                />
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Priorità</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      player.priority === 'Alta' ? 'bg-red-100 text-red-700' :
                      player.priority === 'Media' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {player.priority || 'N/D'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Feedback Direttore</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      player.director_feedback === 'Mi piace' ? 'bg-green-100 text-green-700' :
                      player.director_feedback === 'Non mi piace' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {player.director_feedback || 'N/D'}
                    </span>
                  </div>
                </div>
              </div>

              {player.recommended_action && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    <i className="fas fa-lightbulb mr-2"></i>Azione Consigliata
                  </p>
                  <p className="text-gray-700">{player.recommended_action}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Note */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {player.scout_name && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Scout</p>
                  <p className="font-semibold text-purple-900">
                    <i className="fas fa-user mr-2"></i>{player.scout_name}
                  </p>
                </div>
              )}

              {player.comparison_players && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    <i className="fas fa-balance-scale mr-2"></i>Confronto con Altri Giocatori
                  </p>
                  <p className="text-gray-700">{player.comparison_players}</p>
                </div>
              )}

              {player.injury_history && (
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <p className="text-sm font-semibold text-red-900 mb-2">
                    <i className="fas fa-heartbeat mr-2"></i>Storico Infortuni
                  </p>
                  <p className="text-gray-700">{player.injury_history}</p>
                </div>
              )}

              {player.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">
                    <i className="fas fa-sticky-note mr-2"></i>Note Dettagliate
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">{player.notes}</p>
                </div>
              )}

              {!player.notes && !player.injury_history && !player.comparison_players && (
                <div className="text-center text-gray-500 py-8">
                  <i className="fas fa-inbox text-4xl mb-4"></i>
                  <p>Nessuna nota disponibile per questo giocatore</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <i className="fas fa-calendar mr-1"></i>
            Aggiunto il {new Date(player.created_at).toLocaleDateString('it-IT')}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Chiudi
            </button>
            <button
              onClick={() => {
                if (window.confirm('Sei sicuro di voler eliminare questo giocatore?')) {
                  onDelete(player.id);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <i className="fas fa-trash mr-2"></i>Elimina
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component helper per informazioni
function InfoItem({ label, value, highlight }) {
  return (
    <div className={`${highlight ? 'bg-gradient-to-r from-purple-50 to-blue-50' : ''} p-3 rounded-lg`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-800">{value || 'N/D'}</p>
    </div>
  );
}

// Component helper per sezioni skills
function SkillSection({ title, icon, content, color = 'gray' }) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900'
  };

  if (!content) return null;

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <h4 className="font-semibold mb-2">
        <i className={`${icon} mr-2`}></i>
        {title}
      </h4>
      <p className="text-gray-700">{content}</p>
    </div>
  );
}

export default PlayerDetailModal;