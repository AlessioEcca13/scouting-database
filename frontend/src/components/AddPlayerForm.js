// src/components/AddPlayerForm.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';

function AddPlayerForm({ onSave, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingTransfermarkt, setIsLoadingTransfermarkt] = useState(false);
  const [transfermarktUrl, setTransfermarktUrl] = useState('');
  const [formData, setFormData] = useState({
    // Step 1: Info Base
    name: '',
    birth_year: new Date().getFullYear() - 20,
    team: '',
    nationality: '',
    height: '',
    weight: '',
    
    // Step 2: Caratteristiche Tecniche
    general_role: 'Centrocampo',
    specific_position: '',
    preferred_foot: 'Destro',
    play_style: '',
    functions_labels: '',
    athletic_skills: '',
    technical_skills: '',
    tactical_skills: '',
    
    // Step 3: Valutazioni
    current_value: 3,
    potential_value: 3,
    market_value: '',
    contract_expiry: '',
    priority: 'Media',
    recommended_action: '',
    director_feedback: 'Da valutare',
    
    // Step 4: Note e Osservazioni
    scout_name: '',
    comparison_players: '',
    injury_history: '',
    notes: '',
    
    // Campi aggiuntivi
    transfermarket_link: '',
    youtube_link: '',
    other_links: ''
  });

  const totalSteps = 4;
  const currentYear = new Date().getFullYear();
  const age = currentYear - formData.birth_year;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Funzione per importare dati da Transfermarkt
  const handleImportFromTransfermarkt = async () => {
    if (!transfermarktUrl.trim()) {
      toast.error('Inserisci un URL Transfermarkt valido');
      return;
    }

    if (!transfermarktUrl.includes('transfermarkt')) {
      toast.error('L\'URL deve essere di Transfermarkt');
      return;
    }

    setIsLoadingTransfermarkt(true);
    
    try {
      // Chiama l'API Flask locale
      const response = await fetch('http://localhost:5001/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: transfermarktUrl })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Errore durante l\'importazione');
      }

      // Estrai i dati nel formato database
      const dbData = result.db_format;
      
      // Auto-compila il form con i dati estratti
      setFormData(prev => ({
        ...prev,
        name: dbData.name || prev.name,
        birth_year: dbData.birth_year || prev.birth_year,
        team: dbData.team || prev.team,
        nationality: dbData.nationality || prev.nationality,
        height: dbData.height_cm || prev.height,
        general_role: dbData.general_role || prev.general_role,
        specific_position: dbData.specific_position || prev.specific_position,
        preferred_foot: dbData.preferred_foot || prev.preferred_foot,
        market_value: dbData.market_value || prev.market_value,
        contract_expiry: dbData.contract_expiry || prev.contract_expiry,
        transfermarket_link: dbData.transfermarkt_link || transfermarktUrl,
        notes: dbData.notes || prev.notes
      }));

      toast.success(`✅ Dati importati per ${dbData.name}!`, {
        duration: 4000,
        icon: '🌐'
      });

    } catch (error) {
      console.error('Errore importazione Transfermarkt:', error);
      toast.error(`❌ ${error.message}`);
    } finally {
      setIsLoadingTransfermarkt(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Il nome è obbligatorio!');
      return;
    }

    try {
      await onSave(formData);
      toast.success('Giocatore aggiunto con successo!');
    } catch (error) {
      toast.error('Errore nel salvataggio');
      console.error(error);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error('Inserisci almeno il nome del giocatore');
        return;
      }
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">Aggiungi Nuovo Giocatore</h2>
        <p className="text-gray-600">Compila tutti i campi per aggiungere un nuovo giocatore al database</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                step <= currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 font-medium">
          <span className={currentStep === 1 ? 'text-blue-600' : ''}>📋 Informazioni Base</span>
          <span className={currentStep === 2 ? 'text-blue-600' : ''}>⚽ Caratteristiche Atletiche</span>
          <span className={currentStep === 3 ? 'text-blue-600' : ''}>⭐ Abilità Tecniche</span>
          <span className={currentStep === 4 ? 'text-blue-600' : ''}>📝 Abilità Tattiche</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Informazioni Base */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📋 Informazioni Base
            </h3>
            
            {/* SEZIONE IMPORTAZIONE TRANSFERMARKT */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200 mb-6">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🌐</span>
                <h4 className="font-bold text-blue-700">Importa da Transfermarkt</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Incolla il link del profilo Transfermarkt per compilare automaticamente i campi
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={transfermarktUrl}
                  onChange={(e) => setTransfermarktUrl(e.target.value)}
                  placeholder="https://www.transfermarkt.it/player-name/profil/spieler/123456"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingTransfermarkt}
                />
                <button
                  type="button"
                  onClick={handleImportFromTransfermarkt}
                  disabled={isLoadingTransfermarkt}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoadingTransfermarkt ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      Importa
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Assicurati che l'API Flask sia in esecuzione su localhost:5001
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Mario Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anno di Nascita
                </label>
                <input
                  type="number"
                  min="1990"
                  max={currentYear - 15}
                  value={formData.birth_year}
                  onChange={(e) => handleChange('birth_year', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Età: {age} anni</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Squadra Attuale *
                </label>
                <input
                  type="text"
                  required
                  value={formData.team}
                  onChange={(e) => handleChange('team', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="AC Milan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nazionalità
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="🇮🇹 Italia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altezza (cm)
                </label>
                <input
                  type="number"
                  min="150"
                  max="210"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="180"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  min="50"
                  max="120"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="75"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Caratteristiche Tecniche */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ⚽ Caratteristiche Tecniche
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruolo Generale
                </label>
                <select
                  value={formData.general_role}
                  onChange={(e) => handleChange('general_role', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Portiere">Portiere</option>
                  <option value="Difensore">Difensore</option>
                  <option value="Terzino">Terzino</option>
                  <option value="Centrocampo">Centrocampo</option>
                  <option value="Ala">Ala</option>
                  <option value="Attaccante">Attaccante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posizione Specifica
                </label>
                <input
                  type="text"
                  value={formData.specific_position}
                  onChange={(e) => handleChange('specific_position', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Mediano, Trequartista..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Piede Preferito
                </label>
                <select
                  value={formData.preferred_foot}
                  onChange={(e) => handleChange('preferred_foot', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Destro">Destro</option>
                  <option value="Sinistro">Sinistro</option>
                  <option value="Ambidestro">Ambidestro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stile di Gioco
                </label>
                <input
                  type="text"
                  value={formData.play_style}
                  onChange={(e) => handleChange('play_style', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Tecnico, Fisico, Veloce..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funzioni/Etichette
                </label>
                <input
                  type="text"
                  value={formData.functions_labels}
                  onChange={(e) => handleChange('functions_labels', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Box-to-box, Playmaker, Finalizzatore..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abilità Atletiche
                </label>
                <textarea
                  rows="2"
                  value={formData.athletic_skills}
                  onChange={(e) => handleChange('athletic_skills', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Velocità, resistenza, forza fisica..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abilità Tecniche
                </label>
                <textarea
                  rows="2"
                  value={formData.technical_skills}
                  onChange={(e) => handleChange('technical_skills', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Dribbling, passaggio, tiro..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abilità Tattiche
                </label>
                <textarea
                  rows="2"
                  value={formData.tactical_skills}
                  onChange={(e) => handleChange('tactical_skills', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Posizionamento, visione di gioco..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Valutazioni */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ⭐ Valutazioni e Mercato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valore Attuale (1-5 stelle)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.current_value}
                  onChange={(e) => handleChange('current_value', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-yellow-500 text-2xl text-center">
                  {'★'.repeat(formData.current_value)}{'☆'.repeat(5 - formData.current_value)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Potenziale (1-5 stelle)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.potential_value}
                  onChange={(e) => handleChange('potential_value', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-emerald-500 text-2xl text-center">
                  {'★'.repeat(formData.potential_value)}{'☆'.repeat(5 - formData.potential_value)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valore di Mercato
                </label>
                <input
                  type="text"
                  value={formData.market_value}
                  onChange={(e) => handleChange('market_value', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="€5M, €10M..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scadenza Contratto
                </label>
                <input
                  type="text"
                  value={formData.contract_expiry}
                  onChange={(e) => handleChange('contract_expiry', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="2026, Giugno 2025..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorità
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Alta">🔴 Alta</option>
                  <option value="Media">🟡 Media</option>
                  <option value="Bassa">🟢 Bassa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback Direttore
                </label>
                <select
                  value={formData.director_feedback}
                  onChange={(e) => handleChange('director_feedback', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Mi piace">👍 Mi piace</option>
                  <option value="Da valutare">🤔 Da valutare</option>
                  <option value="Non mi piace">👎 Non mi piace</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Azione Consigliata
                </label>
                <textarea
                  rows="2"
                  value={formData.recommended_action}
                  onChange={(e) => handleChange('recommended_action', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Monitorare, Acquistare subito, Valutare ulteriormente..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Note e Osservazioni */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📝 Note e Collegamenti
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Scout
                </label>
                <input
                  type="text"
                  value={formData.scout_name}
                  onChange={(e) => handleChange('scout_name', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Il tuo nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confronto con Altri Giocatori
                </label>
                <input
                  type="text"
                  value={formData.comparison_players}
                  onChange={(e) => handleChange('comparison_players', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Simile a..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storico Infortuni
                </label>
                <textarea
                  rows="2"
                  value={formData.injury_history}
                  onChange={(e) => handleChange('injury_history', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Eventuali infortuni significativi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note Dettagliate
                </label>
                <textarea
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Osservazioni, punti di forza, debolezze..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Transfermarkt
                </label>
                <input
                  type="url"
                  value={formData.transfermarket_link}
                  onChange={(e) => handleChange('transfermarket_link', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.transfermarkt.it/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Video (YouTube)
                </label>
                <input
                  type="url"
                  value={formData.youtube_link}
                  onChange={(e) => handleChange('youtube_link', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.youtube.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altri Collegamenti
                </label>
                <input
                  type="text"
                  value={formData.other_links}
                  onChange={(e) => handleChange('other_links', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Altri link utili..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Indietro
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              Annulla
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Avanti →
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                💾 Salva Giocatore
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddPlayerForm;