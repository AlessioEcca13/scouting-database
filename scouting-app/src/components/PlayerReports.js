// src/components/PlayerReports.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import AttributeInput from './AttributeInput';
import { getAllStrengths, getAllWeaknesses } from '../data/playerAttributes';
import DirectorFeedbackModal from './DirectorFeedbackModal';

function PlayerReports({ player, onClose }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [showDirectorFeedback, setShowDirectorFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State per attributi categorizzati
  const [strengthAttributes, setStrengthAttributes] = useState([]);
  const [weaknessAttributes, setWeaknessAttributes] = useState([]);
  
  // Form state - TUTTI I REPORT HANNO GLI STESSI CAMPI
  const [formData, setFormData] = useState({
    scout_name: '',
    check_type: 'Live',
    match_name: '',
    match_date: '',
    athletic_data_rating: '🟡',
    final_rating: 'B',
    current_value: 3,
    potential_value: 3,
    strengths: '',
    weaknesses: '',
    notes: ''
  });

  // Carica report esistenti
  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.id]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('player_reports')
        .select('*')
        .eq('player_id', player.id)
        .order('report_date', { ascending: false });

      if (error) throw error;

      setReports(data || []);
      
      // Se non ci sono report, apri automaticamente il form di creazione
      if (!data || data.length === 0) {
        setShowNewReportForm(true);
      } else {
        // Altrimenti non selezionare nessun report
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Errore caricamento report:', error);
      alert('Errore nel caricamento dei report');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🚀 handleSubmit chiamato');
    console.log('📋 formData completo:', formData);
    console.log('💪 strengthAttributes:', strengthAttributes);
    console.log('⚠️ weaknessAttributes:', weaknessAttributes);

    if (!formData.scout_name.trim()) {
      toast.error('⚠️ Inserisci il nome dello scout');
      return;
    }

    if (!formData.strengths || formData.strengths.trim() === '') {
      toast.error('⚠️ Inserisci almeno un punto di forza');
      return;
    }

    if (!formData.weaknesses || formData.weaknesses.trim() === '') {
      toast.error('⚠️ Inserisci almeno un punto debole');
      return;
    }

    if (!formData.notes || formData.notes.trim() === '') {
      toast.error('⚠️ Inserisci le note generali');
      return;
    }

    try {
      // Prepara i dati da inserire (rimuovi campi non esistenti nel DB)
      const reportData = {
        player_id: player.id,
        scout_name: formData.scout_name,
        check_type: formData.check_type,
        match_name: formData.match_name || null,
        match_date: formData.match_date || null,
        athletic_data_rating: formData.athletic_data_rating,
        final_rating: formData.final_rating,
        current_value: formData.current_value,
        potential_value: formData.potential_value,
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        notes: formData.notes
      };

      console.log('📤 Invio report:', reportData);

      const { data, error } = await supabase
        .from('player_reports')
        .insert([reportData])
        .select();

      if (error) {
        console.error('❌ Errore Supabase:', error);
        throw error;
      }

      console.log('✅ Report salvato:', data);
      
      // Controlla quanti scout hanno compilato report per questo giocatore
      const { data: allReports, error: reportsError } = await supabase
        .from('player_reports')
        .select('scout_name')
        .eq('player_id', player.id);
      
      if (!reportsError && allReports) {
        // Ottieni lista scout unici che hanno compilato report
        const uniqueScouts = [...new Set(allReports.map(r => r.scout_name))];
        console.log('👥 Scout che hanno compilato:', uniqueScouts);
        
        // Lista scout previsti (puoi configurarla)
        const expectedScouts = ['Alessio', 'Roberto'];
        
        // Controlla se tutti gli scout hanno compilato
        const allScoutsCompleted = expectedScouts.every(scout => 
          uniqueScouts.includes(scout)
        );
        
        console.log('✅ Tutti gli scout hanno compilato?', allScoutsCompleted);
        
        // Se il giocatore non era scouted E tutti gli scout hanno compilato
        if (!player.is_scouted && allScoutsCompleted) {
          const { error: updateError } = await supabase
            .from('players')
            .update({ is_scouted: true })
            .eq('id', player.id);
          
          if (updateError) {
            console.error('⚠️ Errore aggiornamento is_scouted:', updateError);
          } else {
            console.log('✅ Giocatore spostato nel Database (tutti gli scout hanno compilato)');
            toast.success('✅ Report aggiunto! Tutti gli scout hanno compilato. Il giocatore è ora nel Database.');
          }
        } else if (!player.is_scouted) {
          const remainingScouts = expectedScouts.filter(scout => !uniqueScouts.includes(scout));
          toast.success(`✅ Report aggiunto! In attesa di: ${remainingScouts.join(', ')}`);
        } else {
          toast.success('✅ Report aggiunto con successo!');
        }
      } else {
        toast.success('✅ Report aggiunto con successo!');
      }
      
      setShowNewReportForm(false);
      loadReports();
      
      // Reset form - STESSI CAMPI PER TUTTI I REPORT
      setFormData({
        scout_name: '',
        check_type: 'Live',
        match_name: '',
        match_date: '',
        athletic_data_rating: '🟡',
        final_rating: 'B',
        current_value: 3,
        potential_value: 3,
        strengths: '',
        weaknesses: '',
        notes: ''
      });
      
      // Reset attributi
      setStrengthAttributes([]);
      setWeaknessAttributes([]);
    } catch (error) {
      console.error('❌ Errore inserimento report:', error);
      toast.error(`❌ Errore: ${error.message || 'Impossibile salvare il report'}`);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo report?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('player_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      alert('✅ Report eliminato');
      loadReports();
    } catch (error) {
      console.error('Errore eliminazione report:', error);
      alert('Errore nell\'eliminazione del report');
    }
  };


  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-white text-xl">Caricamento report...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-lg shadow-2xl max-w-5xl w-full my-4 text-white max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 px-4 py-3 flex justify-between items-center rounded-t-lg border-b-2 border-yellow-500 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-2 transition-all flex items-center gap-2"
              title="Torna alla scheda giocatore"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">Indietro</span>
            </button>
            <div>
              <h2 className="text-xl font-bold">📋 Report Scouting</h2>
              <p className="text-xs text-gray-300">{player.name} • {reports.length} report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Selettore Report + Pulsante Nuovo */}
          <div className="flex gap-3 mb-4">
            <select
              value={selectedReport?.id || ''}
              onChange={(e) => {
                const report = reports.find(r => r.id === e.target.value);
                setSelectedReport(report);
                setShowNewReportForm(false);
              }}
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border-2 border-gray-700 focus:border-purple-500 focus:outline-none font-semibold"
              disabled={showNewReportForm}
            >
              <option value="">📋 Seleziona un report da visualizzare...</option>
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.scout_name} • {new Date(report.report_date).toLocaleDateString('it-IT')} • {report.check_type} • {report.final_rating}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowNewReportForm(!showNewReportForm)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuovo
            </button>
          </div>

          {/* Form Nuovo Report */}
          {showNewReportForm && (
            <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-green-500">
              <h3 className="text-lg font-bold mb-3 text-green-400">➕ Nuovo Report</h3>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Info Scout */}
                <div>
                  <label className="block text-xs font-semibold mb-1">📋 Nome Scout *</label>
                  <select
                    value={formData.scout_name}
                    onChange={(e) => setFormData({...formData, scout_name: e.target.value})}
                    className="w-full bg-gray-900 px-4 py-2 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
                    required
                  >
                    <option value="">Seleziona scout...</option>
                    <option value="Alessio">Alessio</option>
                    <option value="Roberto">Roberto</option>
                  </select>
                </div>

                {/* Tipo di Check */}
                <div>
                  <label className="block text-xs font-semibold mb-1">Tipo di Check *</label>
                  <select
                    required
                    value={formData.check_type}
                    onChange={(e) => setFormData({...formData, check_type: e.target.value})}
                    className="w-full bg-gray-900 px-4 py-2 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
                  >
                    <option value="Live">🔴 Live</option>
                    <option value="Video">🎥 Video</option>
                    <option value="Video/Live">🔴🎥 Video/Live</option>
                    <option value="Dati">📊 Dati</option>
                  </select>
                </div>

                {/* Valutazione Dati Atletici (visibile solo se check_type = 'Dati') */}
                {formData.check_type === 'Dati' ? (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <label className="block text-sm font-semibold mb-2">📊 Valutazione Dati Atletici *</label>
                    <select
                      required
                      value={formData.athletic_data_rating}
                      onChange={(e) => setFormData({...formData, athletic_data_rating: e.target.value})}
                      className="w-full bg-gray-800 px-4 py-3 rounded border border-gray-700 focus:border-green-500 focus:outline-none text-center text-2xl font-bold"
                    >
                      <option value="🔴">🔴 Scarso</option>
                      <option value="🟠">🟠 Insufficiente</option>
                      <option value="🟡">🟡 Sufficiente</option>
                      <option value="🟢">🟢 Buono</option>
                      <option value="🏆">🏆 Top</option>
                    </select>
                  </div>
                ) : (
                  <>
                    {/* Campi Partita (visibili solo se check_type != 'Dati') */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Partita</label>
                        <input
                          type="text"
                          value={formData.match_name}
                          onChange={(e) => setFormData({...formData, match_name: e.target.value})}
                          placeholder="es: Juve-Milan (opzionale)"
                          className="w-full bg-gray-900 px-4 py-2 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Data</label>
                        <input
                          type="date"
                          value={formData.match_date}
                          onChange={(e) => setFormData({...formData, match_date: e.target.value})}
                          className="w-full bg-gray-900 px-4 py-2 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Punti di Forza e Debolezza con Autocomplete */}
                <div>
                  <AttributeInput
                    label="💪 Punti di Forza"
                    selectedAttributes={strengthAttributes}
                    onAttributesChange={(attrs) => {
                      setStrengthAttributes(attrs);
                      setFormData({...formData, strengths: attrs.join(', ')});
                    }}
                    suggestions={getAllStrengths()}
                    placeholder="Scrivi o seleziona punti di forza..."
                    required={true}
                  />
                </div>

                <div>
                  <AttributeInput
                    label="⚠️ Punti Deboli"
                    selectedAttributes={weaknessAttributes}
                    onAttributesChange={(attrs) => {
                      setWeaknessAttributes(attrs);
                      setFormData({...formData, weaknesses: attrs.join(', ')});
                    }}
                    suggestions={getAllWeaknesses()}
                    placeholder="Scrivi o seleziona punti deboli..."
                    required={true}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">📝 Note Generali *</label>
                  <textarea
                    required
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="4"
                    className="w-full bg-gray-900 px-4 py-2 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
                    placeholder="Note aggiuntive sul giocatore..."
                  />
                </div>

                {/* Valutazione Attuale e Potenziale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-600">
                    <label className="block text-sm font-semibold mb-3 text-yellow-400">⭐ Valore Attuale *</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.current_value}
                        onChange={(e) => setFormData({...formData, current_value: parseInt(e.target.value)})}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg font-bold text-yellow-700 min-w-[80px] text-center">
                        {formData.current_value} ⭐
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-600">
                    <label className="block text-sm font-semibold mb-3 text-green-400">🚀 Potenziale *</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.potential_value}
                        onChange={(e) => setFormData({...formData, potential_value: parseInt(e.target.value)})}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="px-4 py-2 bg-green-100 border-2 border-green-400 rounded-lg font-bold text-green-700 min-w-[80px] text-center">
                        {formData.potential_value} ⭐
                      </span>
                    </div>
                  </div>
                </div>

                {/* Valutazione Finale */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">⭐ Valutazione Finale *</h4>
                  <select
                    required
                    value={formData.final_rating}
                    onChange={(e) => setFormData({...formData, final_rating: e.target.value})}
                    className="w-full bg-gray-800 px-4 py-3 rounded border border-gray-700 focus:border-yellow-500 focus:outline-none text-center text-2xl font-bold text-yellow-400"
                  >
                    <option value="A">A - Eccellente</option>
                    <option value="B">B - Buono</option>
                    <option value="C">C - Sufficiente</option>
                    <option value="D">D - Insufficiente</option>
                  </select>
                </div>

                {/* Pulsanti */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold transition-all"
                  >
                    ✅ Salva Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewReportForm(false)}
                    className="px-6 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition-all"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Messaggio quando nessun report è selezionato */}
          {!selectedReport && !showNewReportForm && reports.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-12 text-center border-2 border-dashed border-gray-700">
              <svg className="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-400 mb-2">Seleziona un report da visualizzare</h3>
              <p className="text-gray-500">Usa il menu a tendina sopra per scegliere quale report visualizzare</p>
            </div>
          )}

          {/* Messaggio quando non ci sono report */}
          {!selectedReport && !showNewReportForm && reports.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-12 text-center border-2 border-dashed border-gray-700">
              <svg className="w-20 h-20 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-400 mb-2">Nessun report disponibile</h3>
              <p className="text-gray-500 mb-4">Questo giocatore non ha ancora report di scouting</p>
              <button
                onClick={() => setShowNewReportForm(true)}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crea Primo Report
              </button>
            </div>
          )}

          {/* Visualizzazione Report Selezionato */}
          {selectedReport && !showNewReportForm && (
            <div className="bg-gray-800 rounded-lg p-6">
              {/* Header Report */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-purple-400">{selectedReport.scout_name}</h3>
                  <p className="text-gray-400">{selectedReport.scout_role || 'Scout'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedReport.report_date).toLocaleDateString('it-IT', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!selectedReport.director_feedback && (
                    <button
                      onClick={() => setShowDirectorFeedback(true)}
                      className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Aggiungi Feedback Direttore
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedReport.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    🗑️ Elimina
                  </button>
                </div>
              </div>

              {/* Tipo di Check e Contesto */}
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">📋 Tipo di Check</h4>
                <p className="text-lg font-bold text-purple-400">{selectedReport.check_type || 'Live'}</p>
                
                {selectedReport.check_type === 'Dati' ? (
                  <div className="mt-3">
                    {selectedReport.athletic_data_rating && (
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">Valutazione Dati Atletici</p>
                        <p className="text-4xl font-bold">{selectedReport.athletic_data_rating}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {selectedReport.athletic_data_rating === '🔴' && 'Scarso'}
                          {selectedReport.athletic_data_rating === '🟠' && 'Insufficiente'}
                          {selectedReport.athletic_data_rating === '🟡' && 'Sufficiente'}
                          {selectedReport.athletic_data_rating === '🟢' && 'Buono'}
                          {selectedReport.athletic_data_rating === '🏆' && 'Top'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 space-y-1">
                    {selectedReport.match_name && (
                      <p className="text-sm">⚽ {selectedReport.match_name}</p>
                    )}
                    {selectedReport.match_date && (
                      <p className="text-sm">📅 {new Date(selectedReport.match_date).toLocaleDateString('it-IT')}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Valutazione Finale */}
              <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-4 mb-4 text-center border-2 border-yellow-500">
                <h4 className="font-semibold mb-2 text-yellow-400">⭐ Valutazione Finale</h4>
                <p className="text-6xl font-bold text-yellow-400 my-2">{selectedReport.final_rating || 'N/A'}</p>
                <p className="text-sm text-gray-300">
                  {selectedReport.final_rating === 'A' && 'Eccellente'}
                  {selectedReport.final_rating === 'B' && 'Buono'}
                  {selectedReport.final_rating === 'C' && 'Sufficiente'}
                  {selectedReport.final_rating === 'D' && 'Insufficiente'}
                </p>
              </div>

              {/* Punti di Forza e Debolezza */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {selectedReport.strengths && (
                  <div className="bg-green-900 bg-opacity-30 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-green-400">💪 Punti di Forza</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.strengths}</p>
                  </div>
                )}
                {selectedReport.weaknesses && (
                  <div className="bg-red-900 bg-opacity-30 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-red-400">⚠️ Punti Deboli</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.weaknesses}</p>
                  </div>
                )}
              </div>

              {/* Note */}
              {selectedReport.notes && (
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">📝 Note</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedReport.notes}</p>
                </div>
              )}

              {/* Raccomandazione e Priorità */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {selectedReport.recommendation && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">🎯 Raccomandazione</h4>
                    <p className="text-lg font-bold text-yellow-400">{selectedReport.recommendation}</p>
                  </div>
                )}
                {selectedReport.priority && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">🚨 Priorità</h4>
                    <p className="text-lg font-bold text-orange-400">{selectedReport.priority}</p>
                  </div>
                )}
              </div>

              {/* Feedback Direttore */}
              {selectedReport.director_feedback && (
                <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4 border-2 border-purple-500">
                  <h4 className="font-semibold mb-2 text-purple-400">👔 Feedback Direttore</h4>
                  <p className="text-sm font-semibold mb-1">{selectedReport.director_name}</p>
                  {selectedReport.director_feedback_date && (
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(selectedReport.director_feedback_date).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{selectedReport.director_feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Nessun Report */}
          {reports.length === 0 && !showNewReportForm && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">📋 Nessun report disponibile per questo giocatore</p>
              <button
                onClick={() => setShowNewReportForm(true)}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                ➕ Aggiungi Primo Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Feedback Direttore */}
      {showDirectorFeedback && selectedReport && (
        <DirectorFeedbackModal
          report={selectedReport}
          onClose={() => setShowDirectorFeedback(false)}
          onSaved={() => {
            loadReports();
            setShowDirectorFeedback(false);
          }}
        />
      )}
    </div>
  );
}

export default PlayerReports;
