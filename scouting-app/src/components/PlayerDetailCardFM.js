// src/components/PlayerDetailCardFM.js - Stile Football Manager
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import PlayerReports from './PlayerReports';
import CategorizedAttributes from './CategorizedAttributes';

const PlayerDetailCardFM = ({ player, onClose, onAddReport }) => {
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedScout, setSelectedScout] = useState('all');
  
  const currentYear = new Date().getFullYear();
  const age = player.birth_year ? currentYear - player.birth_year : null;

  // Carica tutti i report del giocatore
  useEffect(() => {
    if (!player) return;
    const loadReports = async () => {
      try {
        const { data, error } = await supabase
          .from('player_reports')
          .select('*')
          .eq('player_id', player.id)
          .order('report_date', { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (error) {
        console.error('Errore caricamento report:', error);
      }
    };

    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.id]);

  // Calcola media valutazioni da tutti i report
  const calculateAverageRatings = () => {
    if (reports.length === 0) {
      return {
        currentValue: player.current_value || 0,
        potentialValue: player.potential_value || 0
      };
    }

    // Calcola media da tutti i report che hanno valutazioni
    const reportsWithCurrentValue = reports.filter(r => r.current_value);
    const reportsWithPotentialValue = reports.filter(r => r.potential_value);

    const avgCurrent = reportsWithCurrentValue.length > 0
      ? reportsWithCurrentValue.reduce((sum, r) => sum + r.current_value, 0) / reportsWithCurrentValue.length
      : player.current_value || 0;

    const avgPotential = reportsWithPotentialValue.length > 0
      ? reportsWithPotentialValue.reduce((sum, r) => sum + r.potential_value, 0) / reportsWithPotentialValue.length
      : player.potential_value || 0;

    return {
      currentValue: Math.round(avgCurrent * 2) / 2, // Arrotonda a 0.5
      potentialValue: Math.round(avgPotential * 2) / 2 // Arrotonda a 0.5
    };
  };

  // Aggrega punti di forza da tutti i report CON NOMI SCOUT
  const aggregateStrengths = () => {
    if (reports.length === 0) return player.strong_points || '';
    
    // Combina tutti gli attributi con il nome dello scout
    const allStrengths = reports
      .filter(r => r.strengths)
      .flatMap(r => {
        const attrs = r.strengths.split(',').map(a => a.trim()).filter(a => a);
        return attrs.map(attr => `${attr} (${r.scout_name})`);
      })
      .join(', ');
    
    return allStrengths || player.strong_points || 'Nessun punto di forza registrato';
  };

  // Aggrega punti deboli da tutti i report CON NOMI SCOUT
  const aggregateWeaknesses = () => {
    if (reports.length === 0) return player.weak_points || '';
    
    // Combina tutti gli attributi con il nome dello scout
    const allWeaknesses = reports
      .filter(r => r.weaknesses)
      .flatMap(r => {
        const attrs = r.weaknesses.split(',').map(a => a.trim()).filter(a => a);
        return attrs.map(attr => `${attr} (${r.scout_name})`);
      })
      .join(', ');
    
    return allWeaknesses || player.weak_points || 'Nessun punto debole registrato';
  };

  // Ottieni report dello scout selezionato
  const getSelectedScoutReport = () => {
    if (selectedScout === 'all' || reports.length === 0) {
      return {
        notes: player.notes || 'Nessuna nota disponibile. Seleziona uno scout per vedere le sue note.',
        final_rating: null,
        athletic_data_rating: null,
        scout_name: 'Tutti gli scout'
      };
    }

    const report = reports.find(r => r.scout_name === selectedScout);
    return report || {
      notes: 'Nessuna nota disponibile',
      final_rating: null,
      athletic_data_rating: null,
      scout_name: selectedScout
    };
  };

  const averageRatings = calculateAverageRatings();
  const selectedReport = getSelectedScoutReport();

  // Early return se player non esiste (dopo tutti gli hooks)
  if (!player) return null;

  // Mappa coordinate con Y INVERTITO per visualizzazione corretta
  // Nel CSS: Y basso = alto visivo (AVVERSARI), Y alto = basso visivo (NOSTRA PORTA)
  const POSITION_MAP = {
    // Portieri (nostra porta - basso visivo = Y alto)
    'GK': { x: 50, y: 95 },
    'P': { x: 50, y: 95 },
    'POR': { x: 50, y: 95 },
    'Portiere': { x: 50, y: 95 },
    
    // Difensori (linea difensiva - basso visivo)
    'LB': { x: 15, y: 75 },
    'TS': { x: 15, y: 75 },  // Terzino Sinistro
    'LCB': { x: 38, y: 75 },
    'DCS': { x: 38, y: 75 }, // Difensore Centrale Sinistro
    'CB': { x: 50, y: 75 },
    'DC': { x: 50, y: 75 },  // Difensore Centrale
    'RCB': { x: 62, y: 75 },
    'DCD': { x: 62, y: 75 }, // Difensore Centrale Destro
    'RB': { x: 85, y: 75 },
    'TD': { x: 85, y: 75 },  // Terzino Destro
    'Terzino sinistro': { x: 15, y: 75 },
    'Difensore centrale sinistro': { x: 38, y: 75 },
    'Difensore centrale': { x: 50, y: 75 },
    'Difensore centrale destro': { x: 62, y: 75 },
    'Terzino destro': { x: 85, y: 75 },
    
    // Esterni a 5
    'LWB': { x: 15, y: 55 },
    'ES': { x: 15, y: 55 },  // Esterno Sinistro
    'RWB': { x: 85, y: 55 },
    'ED': { x: 85, y: 55 },  // Esterno Destro
    'Esterno sinistro': { x: 15, y: 55 },
    'Esterno destro': { x: 85, y: 55 },
    'Esterno di sinistra': { x: 15, y: 55 },
    'Esterno di destra': { x: 85, y: 55 },
    
    // Mediani
    'CDM': { x: 50, y: 62 },
    'MED': { x: 50, y: 62 }, // Mediano
    'LDM': { x: 38, y: 60 },
    'RDM': { x: 62, y: 60 },
    'Mediano': { x: 50, y: 62 },
    'Mediano sinistro': { x: 38, y: 60 },
    'Mediano destro': { x: 62, y: 60 },
    
    // Centrocampisti centrali
    'CM': { x: 50, y: 55 },
    'CC': { x: 50, y: 55 },  // Centrocampista Centrale
    'REG': { x: 50, y: 55 }, // Regista
    'LCM': { x: 35, y: 55 },
    'MS': { x: 35, y: 55 },  // Mezzala Sinistra
    'RCM': { x: 65, y: 55 },
    'MD': { x: 65, y: 55 },  // Mezzala Destra
    'Centrocampista': { x: 50, y: 55 },
    'Centrocampista sinistro': { x: 35, y: 55 },
    'Centrocampista destro': { x: 65, y: 55 },
    'Mezzala sinistra': { x: 35, y: 55 },
    'Mezzala destra': { x: 65, y: 55 },
    
    // Esterni di centrocampo
    'LM': { x: 25, y: 55 },
    'RM': { x: 75, y: 55 },
    'EST': { x: 25, y: 55 }, // Esterno (generico)
    
    // Trequartisti
    'CAM': { x: 50, y: 42 },
    'TRQ': { x: 50, y: 42 }, // Trequartista
    'LAM': { x: 35, y: 45 },
    'RAM': { x: 65, y: 45 },
    'Trequartista': { x: 50, y: 42 },
    'Trequartista sinistro': { x: 35, y: 45 },
    'Trequartista destro': { x: 65, y: 45 },
    
    // Ali
    'LW': { x: 20, y: 30 },
    'AS': { x: 20, y: 30 },  // Ala Sinistra
    'RW': { x: 80, y: 30 },
    'AD': { x: 80, y: 30 },  // Ala Destra
    'Ala sinistra': { x: 20, y: 30 },
    'Ala destra': { x: 80, y: 30 },
    
    // Seconde punte
    'SS': { x: 50, y: 32 },
    'LS': { x: 42, y: 30 },
    'RS': { x: 58, y: 30 },
    'Seconda punta': { x: 50, y: 32 },
    'Seconda punta sinistra': { x: 42, y: 32 },
    'Seconda punta destra': { x: 58, y: 32 },
    
    // Attaccanti (porta avversaria - alto visivo = Y basso)
    'ST': { x: 50, y: 25 },
    'PC': { x: 50, y: 25 },  // Punta Centrale
    'AT': { x: 50, y: 25 },  // Attaccante
    'Attaccante': { x: 50, y: 25 },
    'Attaccante sinistro': { x: 42, y: 25 },
    'Attaccante destro': { x: 58, y: 25 },
    'Punta': { x: 50, y: 25 }
  };

  const getPositionCoordinates = (positionName) => {
    if (!positionName) return null;
    
    // Pulisci il nome (rimuovi prefissi come "Difesa - ")
    const cleanName = positionName.replace(/^(Difesa|Centrocampo|Attacco)\s*-\s*/i, '').trim();
    
    // Cerca corrispondenza esatta
    if (POSITION_MAP[cleanName]) {
      return POSITION_MAP[cleanName];
    }
    
    if (POSITION_MAP[positionName]) {
      return POSITION_MAP[positionName];
    }
    
    // Cerca corrispondenza parziale (case insensitive)
    const lowerPos = cleanName.toLowerCase();
    for (const [key, coords] of Object.entries(POSITION_MAP)) {
      if (key.toLowerCase().includes(lowerPos) || lowerPos.includes(key.toLowerCase())) {
        return coords;
      }
    }
    
    return null;
  };

  const formatMarketValue = (value) => {
    if (!value) return 'N/D';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Se il valore è già in milioni (es: 2 = 2 milioni)
    if (numValue >= 1 && numValue < 1000) {
      return `€${numValue.toFixed(2).replace('.', ',')} mln`;
    }
    
    // Se il valore è in formato completo (es: 2000000)
    if (numValue >= 1000000) {
      const millions = numValue / 1000000;
      return `€${millions.toFixed(2).replace('.', ',')} mln`;
    } else if (numValue >= 1000) {
      // Migliaia
      const thousands = numValue / 1000;
      return `€${thousands.toFixed(0)} mila`;
    } else {
      // Centinaia o valore molto basso
      return `€${numValue}`;
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Portiere': 'bg-yellow-500',
      'Difensore': 'bg-blue-500',
      'Terzino': 'bg-blue-400',
      'Centrocampo': 'bg-green-500',
      'Ala': 'bg-purple-500',
      'Attaccante': 'bg-red-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  const getRoleAbbreviation = (position) => {
    if (!position) return '?';
    
    // Pulisci il nome (rimuovi prefissi come "Difesa - ")
    const cleanPos = position.replace(/^(Difesa|Centrocampo|Attacco)\s*-\s*/i, '').trim();
    
    const abbr = {
      // Portieri
      'Portiere': 'POR',
      'GK': 'POR',
      
      // Difensori
      'Difensore centrale': 'DC',
      'Difensore centrale sinistro': 'DCS',
      'Difensore centrale destro': 'DCD',
      'CB': 'DC',
      'CB-L': 'DCS',
      'CB-R': 'DCD',
      
      // Terzini
      'Terzino sinistro': 'TS',
      'Terzino destro': 'TD',
      'LB': 'TS',
      'RB': 'TD',
      
      // Esterni
      'Esterno sinistro': 'ES',
      'Esterno destro': 'ED',
      'Esterno di sinistra': 'ES',
      'Esterno di destra': 'ED',
      'LWB': 'ES',
      'RWB': 'ED',
      
      // Mediani
      'Mediano': 'MED',
      'Mediano sinistro': 'MS',
      'Mediano destro': 'MD',
      'CDM': 'MED',
      'CDM-L': 'MS',
      'CDM-R': 'MD',
      
      // Centrocampisti
      'Centrocampista': 'CC',
      'Centrocampista sinistro': 'CS',
      'Centrocampista destro': 'CD',
      'CM': 'CC',
      'CM-L': 'CS',
      'CM-R': 'CD',
      
      // Mezzali
      'Mezzala sinistra': 'MZS',
      'Mezzala destra': 'MZD',
      'LCM': 'MZS',
      'RCM': 'MZD',
      
      // Trequartisti
      'Trequartista': 'TRQ',
      'Trequartista sinistro': 'TRS',
      'Trequartista destro': 'TRD',
      'CAM': 'TRQ',
      'CAM-L': 'TRS',
      'CAM-R': 'TRD',
      
      // Ali
      'Ala sinistra': 'AS',
      'Ala destra': 'AD',
      'LW': 'AS',
      'RW': 'AD',
      
      // Seconde punte
      'Seconda punta': 'SP',
      'Seconda punta sinistra': 'SPS',
      'Seconda punta destra': 'SPD',
      'SS': 'SP',
      'SS-L': 'SPS',
      'SS-R': 'SPD',
      
      // Attaccanti
      'Attaccante': 'ATT',
      'Attaccante sinistro': 'ATS',
      'Attaccante destro': 'ATD',
      'Punta': 'ATT',
      'ST': 'ATT',
      'ST-L': 'ATS',
      'ST-R': 'ATD'
    };
    
    // Cerca corrispondenza esatta con nome pulito
    if (abbr[cleanPos]) return abbr[cleanPos];
    
    // Cerca corrispondenza esatta con nome originale
    if (abbr[position]) return abbr[position];
    
    // Cerca corrispondenza parziale
    const lowerPos = cleanPos.toLowerCase();
    for (const [key, value] of Object.entries(abbr)) {
      if (key.toLowerCase().includes(lowerPos) || lowerPos.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // Fallback: prime 3 lettere del nome pulito
    return cleanPos.substring(0, 3).toUpperCase();
  };

  const renderStars = (value) => {
    const stars = value || 0;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= Math.floor(stars);
          const isHalf = !isFull && star === Math.ceil(stars) && stars % 1 !== 0;
          
          return (
            <div key={star} className="relative w-4 h-4">
              {/* Stella vuota (sfondo) */}
              <div
                className="absolute inset-0 bg-gray-600"
                style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
              />
              {/* Stella piena o mezza */}
              {(isFull || isHalf) && (
                <div
                  className="absolute inset-0 bg-yellow-400"
                  style={{ 
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                    width: isHalf ? '50%' : '100%'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-xl shadow-2xl w-[95vw] h-[92vh] text-white flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 px-4 py-3 flex justify-between items-center rounded-t-lg border-b-2 border-yellow-500 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-purple-900">
                {player.shirt_number || '?'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{player.name}</h2>
              <p className="text-xs text-gray-300">
                {player.specific_position || player.general_role} • {player.team}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onAddReport && (
              <button
                onClick={() => {
                  onAddReport(player);
                  onClose();
                }}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                📝 Compila
              </button>
            )}
            <button
              onClick={() => setShowReports(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📋 Report
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          
          {/* LAYOUT STILE FM25: 2 COLONNE (Senza Info Destra) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* COLONNA SINISTRA: INFO + CAMPO (3/12) */}
            <div className="lg:col-span-3 space-y-3">
            
            {/* Foto e Info Base - RIDOTTE */}
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              {/* Foto Centrata */}
              <div className="flex justify-center mb-3">
                {player.profile_image ? (
                  <img
                    src={player.profile_image}
                    alt={player.name}
                    className="w-24 h-24 rounded-xl object-cover border-3 border-yellow-500 shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gray-700 flex items-center justify-center border-3 border-gray-600 shadow-lg">
                    <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Info Personali */}
              <div className="space-y-2 text-xs">
                <div className="bg-gray-900 rounded p-1.5">
                  <p className="text-gray-400 text-[10px]">Nazionalità</p>
                  <p className="font-bold text-white text-sm">{player.nationality || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-gray-900 rounded p-1.5">
                    <p className="text-gray-400 text-[10px]">Età</p>
                    <p className="font-bold text-white text-sm">{age ? `${age}` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-900 rounded p-1.5">
                    <p className="text-gray-400 text-[10px]">Anno</p>
                    <p className="font-bold text-white text-sm">{player.birth_year || 'N/A'}</p>
                  </div>
                </div>
                {player.birth_place && (
                  <div className="bg-gray-900 rounded p-1.5">
                    <p className="text-gray-400 text-[10px]">Luogo</p>
                    <p className="font-bold text-white text-[11px]">{player.birth_place}</p>
                  </div>
                )}
              </div>

              {/* Info Contratto - RIDOTTA */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded p-2 mt-2 border border-yellow-600">
                <p className="text-[10px] text-gray-400 mb-1 font-semibold">CONTRATTO</p>
                <p className="text-xs font-bold text-yellow-400 mb-2">{player.team?.toUpperCase()}</p>
                <div className="space-y-1.5">
                  <div>
                    <p className="text-[10px] text-gray-400">Valore</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {formatMarketValue(player.market_value_numeric || player.market_value)}
                    </p>
                  </div>
                  {player.contract_expiry && (
                    <div className="bg-gray-800 rounded p-1.5">
                      <p className="text-[10px] text-gray-400">Scadenza</p>
                      <p className="text-sm font-bold text-white">{player.contract_expiry}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dati Fisici - RIDOTTI */}
              <div className="grid grid-cols-3 gap-1.5 text-center mt-2">
                <div className="bg-gray-900 rounded p-2 border border-gray-700">
                  <p className="text-gray-400 text-[10px]">Alt.</p>
                  <p className="font-bold text-sm text-white">{player.height_cm ? `${player.height_cm}` : 'N/A'}</p>
                  <p className="text-[9px] text-gray-500">cm</p>
                </div>
                <div className="bg-gray-900 rounded p-2 border border-gray-700">
                  <p className="text-gray-400 text-[10px]">Peso</p>
                  <p className="font-bold text-sm text-white">{player.weight_kg ? `${player.weight_kg}` : 'N/A'}</p>
                  <p className="text-[9px] text-gray-500">kg</p>
                </div>
                <div className="bg-gray-900 rounded p-2 border border-gray-700">
                  <p className="text-gray-400 text-[10px]">Piede</p>
                  <p className="font-bold text-sm text-white">{player.preferred_foot || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Campo da Calcio - RIDOTTO */}
            <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
              <h3 className="text-xs font-bold mb-2 text-gray-300 uppercase flex items-center gap-1">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Posizione
              </h3>
              {/* Proporzioni reali: 105m x 68m ≈ 1.54:1 */}
              <div className="bg-gradient-to-b from-green-700 via-green-800 to-green-900 rounded relative overflow-hidden" style={{ width: '100%', paddingBottom: '150%', position: 'relative' }}>
                <div className="absolute inset-0">
                {/* Linee campo - SVG con proporzioni corrette */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid meet">
                  {/* Bordo campo */}
                  <rect x="10" y="10" width="280" height="400" fill="none" stroke="white" strokeWidth="2" opacity="0.4"/>
                  
                  {/* Linea metà campo */}
                  <line x1="10" y1="200" x2="290" y2="200" stroke="white" strokeWidth="2" opacity="0.4"/>
                  
                  {/* Cerchio centrale */}
                  <circle cx="150" cy="200" r="40" fill="none" stroke="white" strokeWidth="2" opacity="0.4"/>
                  <circle cx="150" cy="200" r="3" fill="white" opacity="0.4"/>
                  
                  {/* Area rigore superiore (avversari) */}
                  <rect x="70" y="10" width="160" height="60" fill="none" stroke="white" strokeWidth="2" opacity="0.4"/>
                  <rect x="110" y="10" width="80" height="25" fill="none" stroke="white" strokeWidth="2" opacity="0.4"/>
                  <circle cx="150" cy="70" r="3" fill="white" opacity="0.4"/>
                  
                  {/* Area rigore inferiore (nostra) */}
                  <rect x="70" y="330" width="160" height="60" fill="none" stroke="white" strokeWidth="2" opacity="0.4"/>
                  <rect x="110" y="365" width="80" height="25" fill="none" stroke="white" strokeWidth="2" opacity="0.4"/>
                  <circle cx="150" cy="330" r="3" fill="white" opacity="0.4"/>
                  
                  {/* Angoli */}
                  <path d="M 10 10 Q 20 10 20 20" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                  <path d="M 290 10 Q 280 10 280 20" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                  <path d="M 10 390 Q 20 390 20 380" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                  <path d="M 290 390 Q 280 390 280 380" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                </svg>

                {/* Posizione giocatore principale */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{
                    left: (() => {
                      // Priorità 1: Coordinate da Transfermarkt
                      if (player.field_position_x !== null && player.field_position_x !== undefined) {
                        return `${player.field_position_x}%`;
                      }
                      
                      // Priorità 2: Mappa coordinate per ruolo specifico
                      const coords = getPositionCoordinates(player.specific_position);
                      if (coords) return `${coords.x}%`;
                      
                      // Priorità 3: Fallback generico
                      return '50%';
                    })(),
                    top: (() => {
                      // Priorità 1: Coordinate da Transfermarkt
                      if (player.field_position_y !== null && player.field_position_y !== undefined) {
                        return `${player.field_position_y}%`;
                      }
                      
                      // Priorità 2: Mappa coordinate per ruolo specifico
                      const coords = getPositionCoordinates(player.specific_position);
                      if (coords) return `${coords.y}%`;
                      
                      // Priorità 3: Fallback generico
                      return '50%';
                    })()
                  }}
                >
                  <div className="relative">
                    {/* Ombra */}
                    <div className="absolute inset-0 bg-black rounded-full blur-sm opacity-30 transform translate-y-0.5"></div>
                    
                    {/* Pallino principale - più grande */}
                    <div className={`relative ${getRoleColor(player.general_role)} w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg`}>
                      <span className="text-xs font-bold text-white drop-shadow-sm">
                        {getRoleAbbreviation(player.specific_position)}
                      </span>
                    </div>
                    
                    {/* Numero maglia piccolo sopra */}
                    {player.shirt_number && (
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                        <div className="bg-black bg-opacity-80 px-1.5 py-0.5 rounded text-xs font-bold text-white">
                          #{player.shirt_number}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Posizione alternativa - pallino più piccolo */}
                {player.natural_position && player.natural_position !== player.specific_position && (
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: (() => {
                        const coords = getPositionCoordinates(player.natural_position);
                        if (coords) return `${coords.x}%`;
                        return '55%';
                      })(),
                      top: (() => {
                        const coords = getPositionCoordinates(player.natural_position);
                        if (coords) return `${coords.y}%`;
                        return '55%';
                      })()
                    }}
                  >
                    <div className="relative w-9 h-9 bg-white bg-opacity-90 rounded-full flex items-center justify-center border-2 border-gray-400 shadow-md">
                      <span className="text-[10px] font-bold text-gray-700">
                        {getRoleAbbreviation(player.natural_position)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Altri ruoli - pallino ancora più piccolo */}
                {player.other_positions && (
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: (() => {
                        const coords = getPositionCoordinates(player.other_positions);
                        if (coords) return `${coords.x}%`;
                        return '50%';
                      })(),
                      top: (() => {
                        const coords = getPositionCoordinates(player.other_positions);
                        if (coords) return `${coords.y}%`;
                        return '45%';
                      })()
                    }}
                  >
                    <div className="relative w-8 h-8 bg-gray-300 bg-opacity-85 rounded-full flex items-center justify-center border-2 border-gray-500 shadow-sm">
                      <span className="text-[9px] font-bold text-gray-700">
                        {getRoleAbbreviation(player.other_positions)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Etichette campo */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-red-600 bg-opacity-80 px-3 py-1 rounded-full text-xs font-bold">
                    AVVERSARI
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 bg-opacity-80 px-3 py-1 rounded-full text-xs font-bold">
                    NOSTRA PORTA
                  </div>
                </div>
                </div>
              </div>

              {/* Legenda ruoli - RIDOTTA */}
              <div className="mt-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded p-2 border border-purple-600">
                <h4 className="text-[10px] font-bold text-purple-400 mb-1.5 uppercase">Ruoli</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 bg-gray-800 rounded p-1.5">
                    <div className={`w-3 h-3 ${getRoleColor(player.general_role)} rounded-full border border-white`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-xs truncate">{player.specific_position || player.general_role}</p>
                      <p className="text-[9px] text-gray-400">Principale</p>
                    </div>
                  </div>
                  {player.natural_position && player.natural_position !== player.specific_position && (
                    <div className="flex items-center gap-1.5 bg-gray-800 rounded p-1.5">
                      <div className="w-2 h-2 bg-white rounded-full border border-gray-400"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 font-semibold text-[10px] truncate">{player.natural_position}</p>
                        <p className="text-[9px] text-gray-500">Naturale</p>
                      </div>
                    </div>
                  )}
                  {player.other_positions && (
                    <div className="flex items-center gap-1.5 bg-gray-800 rounded p-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-400 text-[10px] truncate">{player.other_positions}</p>
                        <p className="text-[9px] text-gray-600">Altri</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
            {/* FINE COLONNA SINISTRA */}

            {/* COLONNA CENTRALE: ATTRIBUTI + VALUTAZIONI (9/12) */}
            <div className="lg:col-span-9 space-y-3">
            
            {/* VALUTAZIONI COMPLESSIVE - SOPRA */}
            <div className="bg-gray-800 rounded-lg p-3 border-2 border-yellow-600">
              <h3 className="text-sm font-bold mb-3 text-yellow-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                VALUTAZIONE COMPLESSIVA
              </h3>
              {player.is_scouted === false ? (
                <div className="text-center py-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-500">
                  <svg className="w-8 h-8 mx-auto text-blue-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-blue-300 font-semibold">Giocatore da valutare</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2">Valore Attuale</p>
                    {renderStars(averageRatings.currentValue)}
                    <p className="text-2xl font-bold mt-2 text-yellow-400">{averageRatings.currentValue}/5</p>
                  </div>
                  <div className="text-center bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2">Potenziale</p>
                    {renderStars(averageRatings.potentialValue)}
                    <p className="text-2xl font-bold mt-2 text-green-400">{averageRatings.potentialValue}/5</p>
                  </div>
                </div>
              )}
            </div>

            {/* PUNTI DI FORZA E DEBOLEZZA AFFIANCATI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            
            {/* Punti di Forza - AUMENTATI */}
            <div className="bg-gray-800 rounded-lg p-4 border-2 border-green-600">
              <h3 className="text-base font-bold mb-4 text-green-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                💪 PUNTI DI FORZA
              </h3>
              <div className="min-h-[500px] max-h-[600px] overflow-y-auto pr-2">
                <CategorizedAttributes 
                  attributes={aggregateStrengths()} 
                  type="strengths"
                />
              </div>
            </div>

            {/* Punti Deboli - AUMENTATI */}
            <div className="bg-gray-800 rounded-lg p-4 border-2 border-red-600">
              <h3 className="text-base font-bold mb-4 text-red-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                ⚠️ PUNTI DEBOLI
              </h3>
              <div className="min-h-[500px] max-h-[600px] overflow-y-auto pr-2">
                <CategorizedAttributes 
                  attributes={aggregateWeaknesses()} 
                  type="weaknesses"
                />
              </div>
            </div>
            </div>
            {/* FINE PUNTI FORZA/DEBOLEZZA AFFIANCATI */}

            {/* NOTE SCOUT - Subito dopo valutazioni */}
            <div className="bg-gray-800 rounded-lg p-4 border-2 border-blue-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-blue-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  📝 NOTE SCOUT
                </h3>
                {reports.length > 0 && (
                  <select
                    value={selectedScout}
                    onChange={(e) => setSelectedScout(e.target.value)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-600 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                  >
                    <option value="all">Tutti gli scout</option>
                    {[...new Set(reports.map(r => r.scout_name))].map(scoutName => (
                      <option key={scoutName} value={scoutName}>{scoutName}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="bg-gray-900 rounded-lg p-4 min-h-[150px] max-h-[300px] overflow-y-auto">
                <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                  {selectedReport.notes || 'Nessuna nota disponibile'}
                </p>
              </div>
            </div>

            {/* VALUTAZIONI SCOUT - SOTTO */}
            <div className="bg-gray-800 rounded-lg p-3 border-2 border-yellow-600">
              <h3 className="text-sm font-bold mb-3 text-yellow-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                ⭐ VALUTAZIONI SCOUT
              </h3>
              {reports.length === 0 ? (
                <div className="text-center py-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-500">
                  <svg className="w-8 h-8 mx-auto text-blue-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-lg text-blue-300 font-semibold">Giocatore da valutare</p>
                  <p className="text-sm text-gray-400 mt-2">Nessun report disponibile</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {reports.map((report, idx) => (
                    <div key={idx} className="bg-gray-900 rounded-lg p-3 border border-gray-700 hover:border-yellow-500 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{report.scout_name?.charAt(0) || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{report.scout_name}</p>
                          <p className="text-[9px] text-gray-400">{new Date(report.report_date).toLocaleDateString('it-IT')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        {/* Rating Finale */}
                        {report.final_rating && (
                          <div className="bg-yellow-900 bg-opacity-40 rounded p-1.5 border border-yellow-600">
                            <p className="text-[9px] text-gray-400">Rating</p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-yellow-400">{report.final_rating}</span>
                              <span className="text-[9px] text-gray-300">
                                {report.final_rating === 'A' && 'Eccellente'}
                                {report.final_rating === 'B' && 'Buono'}
                                {report.final_rating === 'C' && 'Suff.'}
                                {report.final_rating === 'D' && 'Insuff.'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Dati Atletici */}
                        {report.athletic_data_rating && (
                          <div className="bg-purple-900 bg-opacity-40 rounded p-1.5 border border-purple-600">
                            <p className="text-[9px] text-gray-400">Dati Atletici</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl">{report.athletic_data_rating}</span>
                              <span className="text-[9px] text-gray-300">
                                {report.athletic_data_rating === '🔴' && 'Scarso'}
                                {report.athletic_data_rating === '🟠' && 'Insuff.'}
                                {report.athletic_data_rating === '🟡' && 'Suff.'}
                                {report.athletic_data_rating === '🟢' && 'Buono'}
                                {report.athletic_data_rating === '🏆' && 'Top'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            </div>
            {/* FINE COLONNA CENTRALE */}

          </div>
          {/* FINE LAYOUT 2 COLONNE */}

          {/* RIMOSSA COLONNA 3: INFO SCOUTING */}
          <div className="space-y-4" style={{display: 'none'}}>
            
            {/* Rapporto Preparatore */}
            <div className="bg-gradient-to-br from-yellow-900 to-orange-900 rounded-lg p-4 border-2 border-yellow-600">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h3 className="text-sm font-bold text-yellow-300">RAPPORTO SCOUT</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-200">Abilità Potenziale</span>
                  {renderStars(player.potential_value)}
                </div>
                <p className="text-xs text-yellow-100 italic">
                  {player.potential_value >= 4 
                    ? "Giocatore importante che può ancora migliorare"
                    : player.potential_value >= 3
                    ? "Buon giocatore con margini di crescita"
                    : "Da valutare ulteriormente"}
                </p>
              </div>
            </div>

            {/* Priorità e Azioni */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-bold mb-3 text-gray-300">GESTIONE</h3>
              <div className="space-y-3">
                {player.priority && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Priorità</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      player.priority === 'Alta' ? 'bg-red-600' :
                      player.priority === 'Media' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}>
                      {player.priority}
                    </span>
                  </div>
                )}
                {player.recommended_action && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Azione</span>
                    <span className="text-sm font-semibold text-white">{player.recommended_action}</span>
                  </div>
                )}
                {player.director_feedback && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Feedback DS</span>
                    <span className="text-sm font-semibold text-white">{player.director_feedback}</span>
                  </div>
                )}
                {player.check_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Tipo Check</span>
                    <span className="text-sm font-semibold text-white">{player.check_type}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Scouting */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-bold mb-3 text-gray-300">INFORMAZIONI SCOUTING</h3>
              <div className="space-y-2 text-sm">
                {player.scout_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Scout</span>
                    <span className="font-semibold">{player.scout_name}</span>
                  </div>
                )}
                {player.scouting_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data</span>
                    <span className="font-semibold">{new Date(player.scouting_date).toLocaleDateString('it-IT')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Link Transfermarkt */}
            {player.transfermarkt_link && (
              <a
                href={player.transfermarkt_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg p-4 text-center font-bold transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Vedi su Transfermarkt
                </div>
              </a>
            )}

            {/* Pulsante Chiudi */}
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              Chiudi Scheda
            </button>
          </div>
        </div>
      </div>

      {/* Modal Report */}
      {showReports && (
        <PlayerReports 
          player={player} 
          onClose={() => setShowReports(false)} 
        />
      )}
    </div>
  );
}

export default PlayerDetailCardFM;
