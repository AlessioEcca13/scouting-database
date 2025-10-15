// src/components/CategorizedAttributes.js
import React from 'react';
import { categorizeAttributes, PLAYER_ATTRIBUTES } from '../data/playerAttributes';

function CategorizedAttributes({ attributes, type = 'strengths', title }) {
  if (!attributes || attributes.trim() === '') {
    return null;
  }

  // Converti stringa in array
  const attributeList = attributes.split(',').map(a => a.trim()).filter(a => a);
  
  // Categorizza gli attributi
  const categorized = categorizeAttributes(attributeList);

  const getCategoryColor = (category) => {
    const colors = {
      tecnica: type === 'strengths' 
        ? 'bg-blue-500 text-white' 
        : 'bg-blue-100 text-blue-800 border-blue-300',
      tattica: type === 'strengths'
        ? 'bg-purple-500 text-white'
        : 'bg-purple-100 text-purple-800 border-purple-300',
      mentale: type === 'strengths'
        ? 'bg-green-500 text-white'
        : 'bg-green-100 text-green-800 border-green-300',
      atletica: type === 'strengths'
        ? 'bg-red-500 text-white'
        : 'bg-red-100 text-red-800 border-red-300',
      altro: type === 'strengths'
        ? 'bg-gray-500 text-white'
        : 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[category];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      tecnica: '⚽',
      tattica: '🧠',
      mentale: '🔥',
      atletica: '🏃‍♂️',
      altro: '📝'
    };
    return icons[category];
  };

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
          {type === 'strengths' ? '💪' : '⚠️'} {title}
        </h4>
      )}

      {Object.entries(categorized).map(([category, attrs]) => {
        if (attrs.length === 0) return null;

        const categoryData = PLAYER_ATTRIBUTES[category];
        
        return (
          <div key={category} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{getCategoryIcon(category)}</span>
              <h5 className="font-semibold text-sm uppercase tracking-wide text-gray-600">
                {categoryData?.label || '📝 Altro'}
              </h5>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {attrs.map((attr, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border ${getCategoryColor(category)} transition-all hover:shadow-md`}
                >
                  {attr}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CategorizedAttributes;
