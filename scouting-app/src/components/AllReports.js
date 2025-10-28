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
      
      // Load all reports with player data
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

      console.log('📊 Reports loaded:', data);
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('❌ Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    if (filter !== 'all' && report.check_type !== filter) return false;
    if (scoutFilter !== 'all' && report.scout_name !== scoutFilter) return false;
    if (ratingFilter !== 'all' && report.final_rating !== ratingFilter) return false;
    return true;
  });

  // Get unique scouts list
  const scouts = [...new Set(reports.map(r => r.scout_name))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-gradient mb-2">📋 All Reports</h2>
        <p className="text-gray-600">View and manage all scouting reports</p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Total:</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
              {reports.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Filtered:</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
              {filteredReports.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="font-bold text-lg mb-4">🔍 Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Check Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Check Type</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="Live">🔴 Live</option>
              <option value="Video">🎥 Video</option>
              <option value="Video/Live">🔴🎥 Video/Live</option>
              <option value="Dati">📊 Data</option>
            </select>
          </div>

          {/* Scout Filter */}
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

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="A">A - Excellent</option>
              <option value="B">B - Good</option>
              <option value="C">C - Sufficient</option>
              <option value="D">D - Insufficient</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No reports found</h3>
            <p className="text-gray-500">Try modifying the filters</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
              onClick={() => onPlayerClick && report.players && onPlayerClick(report.players)}
            >
              <div className="flex items-start gap-6">
                {/* Player Photo */}
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

                {/* Report Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {report.players ? report.players.name : 'Unknown player'}
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
                      <p className="text-xs text-gray-500">Check Type</p>
                      <p className="font-semibold text-gray-800">{report.check_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(report.report_date).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="font-semibold text-gray-800">
                        Current: {report.current_value}⭐ • Potential: {report.potential_value}⭐
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
