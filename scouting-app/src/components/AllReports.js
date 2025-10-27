// src/components/AllReports.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

function AllReports({ onPlayerClick }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, Live, Video, Dati
  const [scoutFilter, setScoutFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      
      // Carica tutti i report con i dati del giocatore
      const { data, error } = await supabase
        .from('player_reports')
        .select(`
          *,
          players (
            id,
            name,
            team,
            general_role,
            birth_year,
            nationality,
            profile_image
          )
        `)
        .order('report_date', { ascending: false });

      if (error) throw error;

      console.log('📊 Report caricati:', data);
      setReports(data || []);
    } catch (error) {
      console.error('Errore caricamento report:', error);
      toast.error('❌ Errore nel caricamento dei report');
    } finally {
      setLoading(false);
    }
  };

  // Filtra i report
  const filteredReports = reports.filter(report => {
    if (filter !== 'all' && report.check_type !== filter) return false;
    if (scoutFilter !== 'all' && report.scout_name !== scoutFilter) return false;
    if (ratingFilter !== 'all' && report.final_rating !== ratingFilter) return false;
    return true;
  });

  // Ottieni lista scout unici
  const scouts = [...new Set(reports.map(r => r.scout_name))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Caricamento report...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-gradient mb-2">📋 Tutti i Report</h2>
        <p className="text-gray-600">Visualizza e gestisci tutti i report di scouting</p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Totale:</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
              {reports.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Filtrati:</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
              {filteredReports.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="font-bold text-lg mb-4">🔍 Filtri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro Tipo Check */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo Check</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="Live">🔴 Live</option>
              <option value="Video">🎥 Video</option>
              <option value="Video/Live">🔴🎥 Video/Live</option>
              <option value="Dati">📊 Dati</option>
            </select>
          </div>

          {/* Filtro Scout */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Scout</label>
            <select
              value={scoutFilter}
              onChange={(e) => setScoutFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              {scouts.map(scout => (
                <option key={scout} value={scout}>{scout}</option>
              ))}
            </select>
          </div>

          {/* Filtro Valutazione */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutte</option>
              <option value="A">A - Eccellente</option>
              <option value="B">B - Buono</option>
              <option value="C">C - Sufficiente</option>
              <option value="D">D - Insufficiente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista Report */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-600 mb-2">Nessun report trovato</h3>
            <p className="text-gray-500">Prova a modificare i filtri</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
              onClick={() => onPlayerClick && report.players && onPlayerClick(report.players)}
            >
              <div className="flex items-start gap-6">
                {/* Foto Giocatore */}
                {report.players && (
                  <div className="flex-shrink-0">
                    {report.players.profile_image ? (
                      <img
                        src={report.players.profile_image}
                        alt={report.players.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}

                {/* Info Report */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {report.players ? report.players.name : 'Giocatore sconosciuto'}
                      </h3>
                      {report.players && (
                        <p className="text-gray-600">
                          {report.players.team} • {report.players.general_role} • {report.players.nationality}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-4 py-2 rounded-full font-bold text-2xl ${
                        report.final_rating === 'A' ? 'bg-green-100 text-green-800' :
                        report.final_rating === 'B' ? 'bg-blue-100 text-blue-800' :
                        report.final_rating === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.final_rating}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Scout</p>
                      <p className="font-semibold text-gray-800">{report.scout_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tipo Check</p>
                      <p className="font-semibold text-gray-800">{report.check_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Data</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(report.report_date).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="font-semibold text-gray-800">
                        Attuale: {report.current_value}⭐ • Potenziale: {report.potential_value}⭐
                      </p>
                    </div>
                  </div>

                  {report.notes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 line-clamp-2">{report.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AllReports;
