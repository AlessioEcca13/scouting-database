// src/components/Navigation.js
import React, { useState } from 'react';

function Navigation({ currentPage, setCurrentPage, playersCount, userProfile, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-700 border-red-300' },
      scout: { label: 'Scout', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-700 border-gray-300' }
    };
    return badges[role] || badges.viewer;
  };
  
  const roleBadge = getRoleBadge(userProfile?.role);
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { id: 'database', label: 'Database', icon: 'fas fa-database' },
    { id: 'segnalazioni', label: 'Segnalazioni', icon: 'fas fa-bookmark' },
    { id: 'add', label: 'Aggiungi Giocatore', icon: 'fas fa-plus-circle' },
    { id: 'reports', label: 'Report', icon: 'fas fa-chart-bar' },
    { id: 'lists', label: 'Liste & Formazioni', icon: 'fas fa-users' },
    { id: 'tactical', label: 'Campo Tattico', icon: 'fas fa-futbol' }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Titolo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo-lamecca.png" 
              alt="La M.E.cca Logo" 
              className="h-12 w-auto"
              onError={(e) => {
                // Fallback all'icona se il logo non è disponibile
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <i className="fas fa-futbol text-3xl text-gradient" style={{ display: 'none' }}></i>
            <div>
              <h1 className="text-xl font-bold text-gradient">La M.E.cca</h1>
              <p className="text-xs text-gray-500">Visione. Intuito. Dati.</p>
            </div>
          </div>
          
          {/* Menu Navigazione */}
          <div className="flex space-x-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 
                  ${currentPage === item.id 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <i className={item.icon}></i>
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Info e Profilo */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <i className="fas fa-users"></i>
                {playersCount}
              </span>
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {userProfile?.full_name?.[0] || 'U'}
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">{userProfile?.full_name}</p>
                    <p className="text-xs text-gray-500">{userProfile?.email}</p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold border ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                  
                  {userProfile?.scout_name && (
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-xs text-gray-500">Scout</p>
                      <p className="text-sm font-semibold text-gray-800">{userProfile.scout_name}</p>
                    </div>
                  )}
                  
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Permessi:</p>
                    <div className="space-y-1">
                      {userProfile?.can_add_players && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Aggiungi giocatori
                        </div>
                      )}
                      {userProfile?.can_add_reports && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Compila report
                        </div>
                      )}
                      {userProfile?.can_manage_lists && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Gestisci liste
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;