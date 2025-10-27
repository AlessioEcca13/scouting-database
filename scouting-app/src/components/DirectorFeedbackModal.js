// src/components/DirectorFeedbackModal.js - Modal per Feedback Direttore
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function DirectorFeedbackModal({ report, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    director_name: '',
    director_feedback: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.director_name.trim() || !formData.director_feedback.trim()) {
      alert('Compila tutti i campi');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('player_reports')
        .update({
          director_feedback: formData.director_feedback,
          director_name: formData.director_name,
          director_feedback_date: new Date().toISOString()
        })
        .eq('id', report.id);

      if (error) throw error;

      alert('✅ Feedback direttore aggiunto!');
      onSaved();
      onClose();
    } catch (error) {
      console.error('Errore salvataggio feedback:', error);
      alert('Errore nel salvataggio del feedback');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-purple-900 via-gray-900 to-purple-900 rounded-lg shadow-2xl max-w-2xl w-full text-white border-2 border-purple-500">
        
        {/* Header */}
        <div className="bg-purple-800 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">👔 Feedback Direttore</h2>
            <p className="text-sm text-gray-300">Report di {report.scout_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Info Report */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">📋 Report Originale</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Scout</p>
                <p className="font-semibold">{report.scout_name}</p>
              </div>
              <div>
                <p className="text-gray-400">Rating</p>
                <p className="font-semibold text-yellow-400 text-lg">{report.final_rating || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Raccomandazione</p>
                <p className="font-semibold">{report.recommendation || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Nome Direttore */}
          <div>
            <label className="block text-sm font-semibold mb-2">Nome Direttore *</label>
            <input
              type="text"
              value={formData.director_name}
              onChange={(e) => setFormData({...formData, director_name: e.target.value})}
              placeholder="es: Giuseppe Verdi"
              className="w-full bg-gray-800 px-4 py-3 rounded border border-gray-700 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold mb-2">Feedback *</label>
            <textarea
              value={formData.director_feedback}
              onChange={(e) => setFormData({...formData, director_feedback: e.target.value})}
              rows="6"
              placeholder="Inserisci il tuo feedback sul report dello scout..."
              className="w-full bg-gray-800 px-4 py-3 rounded border border-gray-700 focus:border-purple-500 focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Il feedback verrà aggiunto al report esistente e sarà visibile a tutti
            </p>
          </div>

          {/* Pulsanti */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 py-3 rounded-lg font-bold transition-all"
            >
              {saving ? '⏳ Salvataggio...' : '✅ Aggiungi Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition-all"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DirectorFeedbackModal;
