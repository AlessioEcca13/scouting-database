# 📋 Guida alle Schede Giocatori

## ✅ Componenti Creati

### 1. **PlayerDetailCard** - Scheda Completa
Scheda dettagliata con tutte le informazioni del giocatore.

**Posizione:** `scouting-app/src/components/PlayerDetailCard.js`

### 2. **PlayerCompactCard** - Scheda Compatta
Card compatta per liste e anteprime.

**Posizione:** `scouting-app/src/components/PlayerCompactCard.js`

---

## 🎨 Cosa Contiene la Scheda Completa

### 📸 **Header con Immagine**
- Immagine profilo (da Transfermarkt o placeholder)
- Nome giocatore
- Badge ruolo con colore
- Badge priorità
- Squadra e nazionalità

### 👤 **Dati Anagrafici**
- Anno di nascita
- Età (calcolata automaticamente)
- Altezza (in cm)
- Peso (in kg)

### ⚽ **Ruolo e Posizione**
- Posizione specifica
- Ruolo naturale (da Transfermarkt)
- Altri ruoli possibili
- Piede preferito

### ⭐ **Valutazioni**
- Valore attuale (stelle 1-5)
- Potenziale (stelle 1-5)
- Potenziale dati (stelle 1-5)

### 💰 **Valore di Mercato**
- Valore in milioni €
- Data ultimo aggiornamento
- Scadenza contratto

### 📊 **Analisi Tecnica**
- **Punti di Forza** (box verde)
- **Punti Deboli** (box rosso)

### 📝 **Note e Info**
- Note aggiuntive
- Scout che ha valutato
- Data scouting
- Tipo di check
- Azione consigliata

### 🔗 **Link Esterni**
- Link a Transfermarkt (se disponibile)

---

## 🎯 Come Usare le Schede

### Apertura Scheda Dettagliata

La scheda si apre automaticamente quando clicchi su un giocatore:

```jsx
// Già integrato in App.js
{selectedPlayer && (
  <PlayerDetailCard 
    player={selectedPlayer} 
    onClose={() => setSelectedPlayer(null)} 
  />
)}
```

### Uso della Card Compatta

Per mostrare liste di giocatori:

```jsx
import PlayerCompactCard from './components/PlayerCompactCard';

<PlayerCompactCard 
  player={player}
  onClick={() => setSelectedPlayer(player)}
/>
```

---

## 🎨 Personalizzazione Colori

### Ruoli
```javascript
const getRoleColor = (role) => {
  const colors = {
    'Portiere': 'bg-yellow-500',      // Giallo
    'Difensore': 'bg-blue-500',       // Blu
    'Terzino': 'bg-blue-400',         // Blu chiaro
    'Centrocampo': 'bg-green-500',    // Verde
    'Ala': 'bg-purple-500',           // Viola
    'Attaccante': 'bg-red-500'        // Rosso
  };
  return colors[role] || 'bg-gray-500';
};
```

### Priorità
```javascript
const getPriorityColor = (priority) => {
  const colors = {
    'Alta': 'bg-red-100 text-red-800',      // Rosso
    'Media': 'bg-yellow-100 text-yellow-800', // Giallo
    'Bassa': 'bg-green-100 text-green-800'   // Verde
  };
  return colors[priority] || 'bg-gray-100';
};
```

---

## 📊 Dati Visualizzati

### Campi del Database Utilizzati

| Campo | Visualizzazione | Sezione |
|-------|----------------|---------|
| `profile_image` | Immagine profilo | Header |
| `name` | Nome completo | Header |
| `general_role` | Badge colorato | Header |
| `priority` | Badge priorità | Header |
| `team` | Squadra attuale | Header |
| `nationality` | Nazionalità | Header |
| `birth_year` | Anno nascita + età | Dati Anagrafici |
| `height_cm` | Altezza in cm | Dati Anagrafici |
| `weight_kg` | Peso in kg | Dati Anagrafici |
| `specific_position` | Posizione | Ruolo |
| `natural_position` | Ruolo naturale | Ruolo |
| `other_positions` | Altri ruoli | Ruolo |
| `preferred_foot` | Piede preferito | Ruolo |
| `current_value` | Stelle 1-5 | Valutazioni |
| `potential_value` | Stelle 1-5 | Valutazioni |
| `data_potential_value` | Stelle 1-5 | Valutazioni |
| `market_value_numeric` | Valore in €M | Valore Mercato |
| `market_value_updated` | Data aggiornamento | Valore Mercato |
| `contract_expiry` | Scadenza contratto | Valore Mercato |
| `strong_points` | Punti di forza | Analisi |
| `weak_points` | Punti deboli | Analisi |
| `notes` | Note complete | Note |
| `scout_name` | Nome scout | Info Scouting |
| `scouting_date` | Data valutazione | Info Scouting |
| `check_type` | Tipo check | Info Scouting |
| `recommended_action` | Azione consigliata | Info Scouting |
| `transfermarkt_link` | Link esterno | Footer |

---

## 🚀 Funzionalità

### ✅ Responsive
- Desktop: Layout a 2-4 colonne
- Mobile: Layout a 1 colonna

### ✅ Immagini
- Caricamento da URL Transfermarkt
- Fallback a placeholder SVG
- Gestione errori automatica

### ✅ Interattività
- Hover effects
- Animazioni smooth
- Click per aprire/chiudere

### ✅ Accessibilità
- Contrasti colori WCAG AA
- Icone descrittive
- Testi leggibili

---

## 🎨 Screenshot Sezioni

### Header
```
┌─────────────────────────────────────┐
│  [IMG]  Nome Giocatore              │
│         [Ruolo] [Priorità]          │
│         Squadra | Nazionalità       │
└─────────────────────────────────────┘
```

### Dati Anagrafici
```
┌──────┬──────┬──────┬──────┐
│ Anno │ Età  │ Alt. │ Peso │
│ 1999 │ 25   │ 192  │ 85   │
└──────┴──────┴──────┴──────┘
```

### Valutazioni
```
Valore Attuale    Potenziale    Pot. Dati
★★★★☆ 4/5        ★★★★★ 5/5     ★★★★☆ 4/5
```

### Analisi Tecnica
```
┌─────────────────┬─────────────────┐
│ ✅ Punti Forza  │ ❌ Punti Deboli │
│ - Velocità      │ - Tiro          │
│ - Dribbling     │ - Fisico        │
└─────────────────┴─────────────────┘
```

---

## 🔧 Personalizzazione

### Aggiungere Nuove Sezioni

```jsx
{/* Nuova sezione */}
<div className="mb-8">
  <h3 className="text-xl font-bold text-gray-800 mb-4">
    Titolo Sezione
  </h3>
  <div className="bg-gray-50 p-6 rounded-lg">
    {/* Contenuto */}
  </div>
</div>
```

### Modificare Stili

Tutte le classi usano **Tailwind CSS**:
- `bg-*` = Background
- `text-*` = Testo
- `p-*` = Padding
- `rounded-*` = Bordi arrotondati
- `shadow-*` = Ombra

---

## 📱 Responsive Breakpoints

- **Mobile:** < 768px (1 colonna)
- **Tablet:** 768px - 1024px (2 colonne)
- **Desktop:** > 1024px (3-4 colonne)

---

## ✅ Checklist Implementazione

- [x] Componente PlayerDetailCard creato
- [x] Componente PlayerCompactCard creato
- [x] Integrato in App.js
- [x] Gestione immagini con fallback
- [x] Calcolo età automatico
- [x] Stelle per valutazioni
- [x] Colori per ruoli e priorità
- [x] Sezioni punti forza/deboli
- [x] Link Transfermarkt
- [x] Responsive design
- [x] Animazioni e hover effects

---

## 🎯 Prossimi Passi

1. **Testa le schede** cliccando su un giocatore
2. **Aggiungi giocatori** con dati completi
3. **Importa da Transfermarkt** per avere immagini e dati
4. **Personalizza colori** se necessario

---

**Le schede sono pronte all'uso!** 🎉

Clicca su qualsiasi giocatore per vedere la scheda dettagliata.
