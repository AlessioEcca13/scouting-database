// src/components/AttributeInput.js
import React, { useState, useRef, useEffect } from 'react';
import { filterSuggestions } from '../data/playerAttributes';

function AttributeInput({ 
  label, 
  selectedAttributes = [], 
  onAttributesChange, 
  suggestions = [],
  placeholder = "Scrivi o seleziona...",
  required = false
}) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filtra suggerimenti quando cambia l'input
  useEffect(() => {
    if (inputValue.length >= 2) {
      const filtered = filterSuggestions(inputValue, suggestions);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions]);

  // Chiudi suggerimenti quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addAttribute = (value) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !selectedAttributes.includes(trimmedValue)) {
      onAttributesChange([...selectedAttributes, trimmedValue]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeAttribute = (index) => {
    const newAttributes = selectedAttributes.filter((_, i) => i !== index);
    onAttributesChange(newAttributes);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        addAttribute(filteredSuggestions[0].value);
      } else if (inputValue.trim()) {
        addAttribute(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedAttributes.length > 0) {
      removeAttribute(selectedAttributes.length - 1);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      tecnica: 'bg-blue-100 text-blue-700 border-blue-300',
      tattica: 'bg-purple-100 text-purple-700 border-purple-300',
      mentale: 'bg-green-100 text-green-700 border-green-300',
      atletica: 'bg-red-100 text-red-700 border-red-300',
      altro: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[category] || colors.altro;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      tecnica: '⚽',
      tattica: '🧠',
      mentale: '🔥',
      atletica: '🏃‍♂️',
      altro: '📝'
    };
    return icons[category] || icons.altro;
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Tags selezionati */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 bg-gray-50 rounded-lg border-2 border-gray-200">
        {selectedAttributes.map((attr, index) => {
          // Trova la categoria dell'attributo
          const suggestion = suggestions.find(s => s.value === attr);
          const category = suggestion?.category || 'altro';
          
          return (
            <div
              key={index}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border-2 transition-all hover:shadow-md ${getCategoryColor(category)}`}
            >
              <span>{getCategoryIcon(category)}</span>
              <span>{attr}</span>
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                className="ml-1 hover:bg-white hover:bg-opacity-50 rounded-full p-0.5 transition-colors"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          );
        })}
        {selectedAttributes.length === 0 && (
          <span className="text-gray-400 text-sm italic">Nessun attributo selezionato</span>
        )}
      </div>

      {/* Input con autocomplete */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        {/* Suggerimenti dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addAttribute(suggestion.value)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors border-l-4 ${
                  suggestion.category === 'tecnica' ? 'border-blue-500' :
                  suggestion.category === 'tattica' ? 'border-purple-500' :
                  suggestion.category === 'mentale' ? 'border-green-500' :
                  suggestion.category === 'atletica' ? 'border-red-500' :
                  'border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{suggestion.value}</div>
                    <div className="text-xs text-gray-500">{suggestion.label}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="mt-1 text-xs text-gray-500">
        💡 Scrivi almeno 2 caratteri per vedere i suggerimenti o premi Invio per aggiungere un attributo personalizzato
      </p>

      {/* Input nascosto per validazione form */}
      {required && (
        <input
          type="text"
          value={selectedAttributes.join(',')}
          required
          style={{ display: 'none' }}
          readOnly
        />
      )}
    </div>
  );
}

export default AttributeInput;
