// src/components/Navigation.js
import React, { useState, useEffect, useRef } from 'react';

function Navigation({ currentPage, setCurrentPage, playersCount, userProfile, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  
  // Chiudi menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
    { id: 'segnalazioni', label: 'Bookmarks', icon: 'fas fa-bookmark' },
    { id: 'add', label: 'Add Player', icon: 'fas fa-plus-circle' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { id: 'lists', label: 'Lists & Formations', icon: 'fas fa-users' },
    { id: 'tactical', label: 'Tactical Board', icon: 'fas fa-futbol' }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo e Titolo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src="/logo-lamecca.png" 
              alt="La M.E.cca Logo" 
              className="h-8 sm:h-10 lg:h-12 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <i className="fas fa-futbol text-2xl sm:text-3xl text-gradient" style={{ display: 'none' }}></i>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gradient">La M.E.cca</h1>
              <p className="text-xs text-gray-500 hidden lg:block">Vision. Insight. Data.</p>
            </div>
          </div>
          
          {/* Menu Desktop - Nascosto su mobile */}
          <div className="hidden lg:flex space-x-1 xl:space-x-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-2 xl:px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1 xl:space-x-2 text-sm xl:text-base
                  ${currentPage === item.id 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <i className={item.icon}></i>
                <span className="hidden xl:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Info e Profilo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Counter - Nascosto su mobile piccolo */}
            <div className="hidden sm:flex text-xs sm:text-sm text-gray-500 items-center gap-2">
              <span className="flex items-center gap-1">
                <i className="fas fa-users"></i>
                <span className="hidden md:inline">{playersCount}</span>
              </span>
            </div>
            
            {/* Hamburger Menu - Solo mobile */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  {userProfile?.full_name?.[0] || 'U'}
                </div>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
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
                    <p className="text-xs text-gray-500 mb-1">Permissions:</p>
                    <div className="space-y-1">
                      {userProfile?.can_add_players && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Add players
                        </div>
                      )}
                      {userProfile?.can_add_reports && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Create reports
                        </div>
                      )}
                      {userProfile?.can_manage_lists && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Manage lists
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
        
        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div 
            ref={mobileMenuRef}
            className="lg:hidden absolute top-14 sm:top-16 left-0 right-0 bg-white shadow-xl border-t border-gray-200 z-40 animate-slideDown"
          >
            <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 text-left
                    ${currentPage === item.id 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <i className={`${item.icon} w-5 text-center`}></i>
                  <span className="font-medium">{item.label}</span>
                  {currentPage === item.id && (
                    <i className="fas fa-check ml-auto"></i>
                  )}
                </button>
              ))}
              
              {/* Info Mobile */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-600 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-users"></i>
                    Players in database
                  </span>
                  <span className="font-bold text-purple-600">{playersCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;