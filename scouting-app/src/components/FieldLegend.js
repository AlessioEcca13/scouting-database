// src/components/FieldLegend.js - Legenda colori per il campo tattico
import React from 'react';

function FieldLegend({ colorPresets, onColorClick }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        Legenda Colori
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {colorPresets.map((preset, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 rounded-lg border-2 hover:border-blue-400 transition-all cursor-pointer"
            style={{
              backgroundColor: preset.color,
              color: preset.textColor,
              borderColor: preset.color
            }}
            onClick={() => onColorClick && onColorClick(preset)}
            title={`Click per applicare: ${preset.name}`}
          >
            <div 
              className="w-4 h-4 rounded-full border-2 flex-shrink-0" 
              style={{ 
                backgroundColor: preset.color,
                borderColor: preset.textColor
              }} 
            />
            <span className="text-xs font-semibold truncate">{preset.name}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3 italic">
        💡 Suggerimento: Clicca su un giocatore e poi seleziona un colore per evidenziarlo
      </p>
    </div>
  );
}

export default FieldLegend;
