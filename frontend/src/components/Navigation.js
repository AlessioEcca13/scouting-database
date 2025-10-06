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
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Titolo */}
          <div className="flex items-center space-x-3">
            <i className="fas fa-futbol text-3xl text-gradient"></i>
            <div>
              <h1 className="text-xl font-bold text-gradient">Scouting System</h1>
              <p className="text-xs text-gray-500">Database Professionale</p>
            </div>
          </div>
          
          {/* Menu Navigazione */}
          <div className="flex space-x-2">
            {navItems.map(item => (
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
            <span className="text-sm text-gray-500">
              <i className="fas fa-users mr-1"></i>
              {playersCount} giocatori
            </span>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <i className="fas fa-user text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;