// src/data/playerAttributes.js
// Liste predefinite di punti di forza e debolezza categorizzati

export const PLAYER_ATTRIBUTES = {
  // AREA TECNICA
  tecnica: {
    label: '⚽ Area Tecnica',
    color: 'blue',
    strengths: [
      'Controllo e primo tocco',
      'Conduzione palla',
      'Dribbling 1vs1',
      'Uso dei due piedi',
      'Passaggio corto',
      'Passaggio lungo',
      'Visione di gioco',
      'Cross / traversoni',
      'Tiro da fuori',
      'Tiro in area',
      'Colpo di testa',
      'Precisione conclusiva',
      'Protezione palla',
      'Gioco a uno o due tocchi',
      'Lancio e cambio gioco',
      '1vs1 difensivo',
      'Anticipo / intercetto',
      'Tackling',
      'Duelli aerei difensivi',
      'Copertura e diagonali'
    ],
    weaknesses: [
      'Controllo e primo tocco impreciso',
      'Conduzione palla limitata',
      'Dribbling 1vs1 inefficace',
      'Uso limitato piede debole',
      'Passaggio corto impreciso',
      'Passaggio lungo impreciso',
      'Visione di gioco limitata',
      'Cross / traversoni inefficaci',
      'Tiro da fuori impreciso',
      'Tiro in area debole',
      'Colpo di testa scarso',
      'Precisione conclusiva bassa',
      'Protezione palla debole',
      'Gioco a uno o due tocchi da migliorare',
      'Lancio e cambio gioco impreciso',
      '1vs1 difensivo debole',
      'Anticipo / intercetto in ritardo',
      'Tackling impreciso',
      'Duelli aerei difensivi persi',
      'Copertura e diagonali sbagliate'
    ]
  },

  // AREA TATTICO-COGNITIVA
  tattica: {
    label: '🧠 Area Tattico-Cognitiva',
    color: 'purple',
    strengths: [
      'Lettura del gioco',
      'Posizionamento',
      'Movimenti senza palla',
      'Decision making',
      'Tempi di gioco',
      'Comprensione tattica',
      'Transizioni (positive/negative)',
      'Pressing e riaggressione',
      'Copertura compagni',
      'Occupazione spazi',
      'Adattabilità tattica',
      'Gestione rischio'
    ],
    weaknesses: [
      'Lettura del gioco lenta',
      'Posizionamento scorretto',
      'Movimenti senza palla scarsi',
      'Decision making errato',
      'Tempi di gioco sbagliati',
      'Comprensione tattica limitata',
      'Transizioni lente',
      'Pressing e riaggressione disordinati',
      'Copertura compagni insufficiente',
      'Occupazione spazi confusa',
      'Adattabilità tattica limitata',
      'Gestione rischio eccessiva/insufficiente'
    ]
  },

  // AREA PSICOLOGICA / COMPORTAMENTALE
  mentale: {
    label: '🔥 Area Psicologica / Comportamentale',
    color: 'green',
    strengths: [
      'Aggressività positiva',
      'Determinazione',
      'Concentrazione',
      'Leadership',
      'Spirito di squadra',
      'Disponibilità al sacrificio',
      'Disciplina tattica',
      'Coraggio / fiducia',
      'Comunicazione',
      'Reazione agli errori'
    ],
    weaknesses: [
      'Aggressività eccessiva/insufficiente',
      'Determinazione limitata',
      'Concentrazione discontinua',
      'Leadership assente',
      'Spirito di squadra scarso',
      'Disponibilità al sacrificio limitata',
      'Disciplina tattica carente',
      'Coraggio / fiducia insufficiente',
      'Comunicazione scarsa',
      'Reazione negativa agli errori'
    ]
  },

  // AREA ATLETICA / FISICA
  atletica: {
    label: '🏃‍♂️ Area Atletica / Fisica',
    color: 'red',
    strengths: [
      'Accelerazione',
      'Velocità massima',
      'Cambi di direzione',
      'Esplosività',
      'Forza nei duelli',
      'Elevazione',
      'Resistenza / intensità',
      'Recupero dopo sforzo',
      'Agilità / equilibrio',
      'Coordinazione motoria'
    ],
    weaknesses: [
      'Accelerazione lenta',
      'Velocità massima limitata',
      'Cambi di direzione lenti',
      'Esplosività scarsa',
      'Forza nei duelli insufficiente',
      'Elevazione bassa',
      'Resistenza / intensità limitata',
      'Recupero dopo sforzo lento',
      'Agilità / equilibrio precario',
      'Coordinazione motoria da migliorare'
    ]
  }
};

// Funzione helper per ottenere tutti i punti di forza
export const getAllStrengths = () => {
  return Object.entries(PLAYER_ATTRIBUTES).reduce((acc, [category, data]) => {
    return [...acc, ...data.strengths.map(s => ({ value: s, category, label: data.label }))];
  }, []);
};

// Funzione helper per ottenere tutti i punti deboli
export const getAllWeaknesses = () => {
  return Object.entries(PLAYER_ATTRIBUTES).reduce((acc, [category, data]) => {
    return [...acc, ...data.weaknesses.map(w => ({ value: w, category, label: data.label }))];
  }, []);
};

// Funzione per filtrare suggerimenti in base al testo
export const filterSuggestions = (text, list) => {
  if (!text || text.length < 2) return [];
  const searchText = text.toLowerCase();
  return list.filter(item => 
    item.value.toLowerCase().includes(searchText)
  ).slice(0, 10); // Max 10 suggerimenti
};

// Funzione per categorizzare una lista di attributi
export const categorizeAttributes = (attributes) => {
  const categorized = {
    tecnica: [],
    tattica: [],
    mentale: [],
    atletica: [],
    altro: [] // Per attributi custom
  };

  attributes.forEach(attr => {
    // Rimuovi "(Nome Scout)" alla fine per il matching, ma mantienilo nella visualizzazione
    const attrForMatching = attr.replace(/\s*\([^)]+\)\s*$/, '').trim();
    
    let found = false;
    for (const [category, data] of Object.entries(PLAYER_ATTRIBUTES)) {
      if (data.strengths.includes(attrForMatching) || data.weaknesses.includes(attrForMatching)) {
        categorized[category].push(attr); // Mantieni l'attributo originale con il nome
        found = true;
        break;
      }
    }
    if (!found) {
      categorized.altro.push(attr);
    }
  });

  return categorized;
};
