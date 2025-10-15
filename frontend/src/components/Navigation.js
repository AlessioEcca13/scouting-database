// src/components/Navigation.js
import React from 'react';

function Navigation({ currentPage, setCurrentPage, playersCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { id: 'database', label: 'Database', icon: 'fas fa-database' },
    { id: 'add', label: 'Aggiungi Giocatore', icon: 'fas fa-plus-circle' },
    { id: 'reports', label: 'Report', icon: 'fas fa-chart-bar' }
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Titolo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <i className="fas fa-futbol text-2xl text-blue-600"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Scouting System</h1>
              <p className="text-xs text-blue-100">Database Professionale</p>
            </div>
          </div>
          
          {/* Menu Navigazione */}
          <div className="flex space-x-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm font-medium
                  ${currentPage === item.id 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'}`}
              >
                <i className={item.icon}></i>
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Info e Profilo */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-blue-100">
              {playersCount} giocatori
            </span>
            <button className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors">
              <i className="fas fa-user text-white"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;