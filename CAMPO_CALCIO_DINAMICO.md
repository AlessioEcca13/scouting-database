# ⚽ Campo da Calcio con Posizionamento Dinamico

## ✅ IMPLEMENTATO!

Ho creato un campo da calcio realistico con **posizionamento automatico** del giocatore in base al ruolo.

---

## 🎨 Design Campo

### **Dimensioni**
- **Altezza:** 400px
- **Proporzioni:** Realistiche (campo verticale)
- **Colore:** Gradiente verde (scuro → medio → scuro)

### **Elementi Grafici**

#### **Linee Bianche (SVG)**
- ✅ Bordo campo
- ✅ Linea metà campo
- ✅ Cerchio centrale con punto
- ✅ Area rigore superiore (avversari)
- ✅ Area rigore inferiore (nostra)
- ✅ Area piccola (entrambe)
- ✅ Punti rigore
- ✅ Angoli arrotondati

#### **Etichette**
- 🔴 **AVVERSARI** (top, rosso)
- 🔵 **NOSTRA PORTA** (bottom, blu)

---

## 🎯 Posizionamento Dinamico

Il pallino del giocatore si posiziona **automaticamente** in base al ruolo:

### **Mappa Posizioni**

| Ruolo | Posizione Y | Descrizione |
|-------|-------------|-------------|
| **Portiere** | 92% | Vicino alla porta |
| **Difensore Centrale** | 78% | Linea difensiva centrale |
| **Difensore** | 75% | Linea difensiva |
| **Terzino** | 70% | Fascia difensiva |
| **Mediano/Difensivo** | 60% | Centrocampo difensivo |
| **Centrocampista** | 50% | Centro campo |
| **Trequartista/Offensivo** | 40% | Centrocampo offensivo |
| **Ala/Esterno** | 35% | Fascia offensiva |
| **Seconda Punta** | 30% | Supporto attacco |
| **Attaccante/Punta** | 20% | Linea d'attacco |

### **Logica JavaScript**

```javascript
const role = player.general_role?.toLowerCase() || '';
const position = player.specific_position?.toLowerCase() || '';

// Portiere
if (role.includes('portiere') || position.includes('portiere')) 
  return '92%';

// Difensori
if (role.includes('difensor') || position.includes('difensor')) {
  if (position.includes('centrale')) return '78%';
  return '75%';
}

// Terzini
if (role.includes('terzino') || position.includes('terzino')) 
  return '70%';

// Centrocampisti
if (role.includes('centrocampo') || position.includes('centrocampo')) {
  if (position.includes('difensiv') || position.includes('mediano')) 
    return '60%';
  if (position.includes('offensiv') || position.includes('trequartista')) 
    return '40%';
  return '50%';
}

// Ali
if (role.includes('ala') || position.includes('ala') || position.includes('esterno')) 
  return '35%';

// Attaccanti
if (role.includes('attaccante') || position.includes('attaccante') || position.includes('punta')) {
  if (position.includes('seconda')) return '30%';
  return '20%';
}

return '50%'; // Default centro campo
```

---

## 🎨 Pallino Giocatore

### **Design**
- **Dimensione:** 20x20 (80px)
- **Forma:** Cerchio perfetto
- **Bordo:** 4px bianco
- **Colore:** Dinamico in base al ruolo
- **Numero:** Grande (3xl) bianco con ombra
- **Ombra:** Nera sfocata sotto il pallino
- **Hover:** Scala 110% (effetto zoom)

### **Colori per Ruolo**

```javascript
const getRoleColor = (role) => {
  const colors = {
    'Portiere': 'bg-yellow-500',      // 🟡 Giallo
    'Difensore': 'bg-blue-500',       // 🔵 Blu
    'Terzino': 'bg-blue-400',         // 🔵 Blu chiaro
    'Centrocampo': 'bg-green-500',    // 🟢 Verde
    'Ala': 'bg-purple-500',           // 🟣 Viola
    'Attaccante': 'bg-red-500'        // 🔴 Rosso
  };
  return colors[role] || 'bg-gray-500';
};
```

### **Badge Ruolo**
- Sotto il pallino
- Sfondo nero semi-trasparente
- Bordo bianco sottile
- Testo piccolo bianco

---

## 📐 Schema Visivo

```
┌─────────────────────────────────┐
│      🔴 AVVERSARI               │
│  ┌─────────────────────────┐    │
│  │  ⚽ Area rigore          │    │
│  │  [□] Area piccola       │    │
│  └─────────────────────────┘    │
│                                  │
│  ─────────────────────────────  │ ← Metà campo
│         ⭕ Cerchio               │
│                                  │
│                                  │
│         [●] ← Giocatore          │ ← Posizione dinamica
│         Ruolo                    │
│                                  │
│  ┌─────────────────────────┐    │
│  │  [□] Area piccola       │    │
│  │  ⚽ Area rigore          │    │
│  └─────────────────────────┘    │
│      🔵 NOSTRA PORTA            │
└─────────────────────────────────┘
```

---

## 🎯 Esempi Posizionamento

### **Portiere**
```
Porta ████████████
      ↑
     [●] 92%
```

### **Difensore Centrale**
```
Porta ████████████
      
      
     [●] 78%
```

### **Centrocampista**
```
─────────────────
     [●] 50%
─────────────────
```

### **Attaccante**
```
     [●] 20%
      
      
Porta ████████████
```

---

## ✨ Effetti Speciali

### **Ombra Realistica**
```css
.absolute.inset-0.bg-black.rounded-full.blur-md.opacity-50.transform.translate-y-2
```
- Ombra nera sfocata
- Spostata leggermente in basso
- Opacità 50%

### **Hover Effect**
```css
.transform.hover:scale-110.transition-transform
```
- Zoom 110% al passaggio del mouse
- Transizione smooth

### **Animazione Entrata**
```css
.transition-all.duration-300
```
- Transizione fluida quando cambia posizione
- Durata 300ms

---

## 🎨 Codice SVG Campo

```svg
<svg viewBox="0 0 300 400">
  <!-- Bordo -->
  <rect x="10" y="10" width="280" height="380" stroke="white"/>
  
  <!-- Metà campo -->
  <line x1="10" y1="200" x2="290" y2="200" stroke="white"/>
  
  <!-- Cerchio centrale -->
  <circle cx="150" cy="200" r="40" stroke="white"/>
  <circle cx="150" cy="200" r="3" fill="white"/>
  
  <!-- Aree rigore -->
  <rect x="70" y="10" width="160" height="60" stroke="white"/>
  <rect x="70" y="330" width="160" height="60" stroke="white"/>
  
  <!-- Aree piccole -->
  <rect x="110" y="10" width="80" height="25" stroke="white"/>
  <rect x="110" y="365" width="80" height="25" stroke="white"/>
  
  <!-- Punti rigore -->
  <circle cx="150" cy="70" r="3" fill="white"/>
  <circle cx="150" cy="330" r="3" fill="white"/>
  
  <!-- Angoli -->
  <path d="M 10 10 Q 20 10 20 20" stroke="white"/>
  <!-- ... altri angoli ... -->
</svg>
```

---

## 📱 Responsive

Il campo si adatta automaticamente:
- **Desktop:** 400px altezza
- **Tablet:** Mantiene proporzioni
- **Mobile:** Scala proporzionalmente

---

## 🚀 Come Funziona

1. **Legge il ruolo** del giocatore (`general_role` e `specific_position`)
2. **Calcola la posizione Y** in base alla logica
3. **Posiziona il pallino** dinamicamente
4. **Applica il colore** in base al ruolo
5. **Mostra il numero** maglia nel pallino
6. **Badge ruolo** sotto il pallino

---

## ✅ Vantaggi

- ✅ **Visuale immediata** della posizione
- ✅ **Automatico** - nessuna configurazione manuale
- ✅ **Realistico** - proporzioni campo reali
- ✅ **Interattivo** - hover effect
- ✅ **Professionale** - stile Football Manager
- ✅ **Responsive** - funziona su tutti i dispositivi

---

## 🎯 Personalizzazione

### Modificare Posizioni
Edita le percentuali nel codice:

```javascript
// Esempio: spostare attaccanti più avanti
if (role.includes('attaccante')) return '15%'; // era 20%
```

### Aggiungere Ruoli
Aggiungi nuove condizioni:

```javascript
// Esempio: aggiungere regista
if (position.includes('regista')) return '55%';
```

### Cambiare Colori
Modifica la funzione `getRoleColor`:

```javascript
'Centrocampo': 'bg-emerald-500', // Verde smeraldo
```

---

**Il campo è pronto e funzionante!** 🎉

Ogni giocatore viene posizionato automaticamente nella posizione corretta del campo.
