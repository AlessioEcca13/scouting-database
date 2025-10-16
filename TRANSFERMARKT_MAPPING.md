# 🔄 Mappatura Transfermarkt → Database

## Panoramica

Quando importi un giocatore da Transfermarkt, il sistema esegue automaticamente queste conversioni:

1. **Ruolo Generale** → Uno dei 6 ruoli disponibili
2. **Posizione Specifica** → Abbreviazione (es: TS, DC, ATT)
3. **Posizioni Alternative** → Abbreviazioni

---

## 📊 Ruoli Generali (6 disponibili)

Il campo `general_role` può avere solo questi valori:

| Icona | Ruolo | Descrizione |
|-------|-------|-------------|
| 🥅 | **Portiere** | Portieri |
| 🛡️ | **Difensore** | Difensori centrali |
| ↔️ | **Terzino** | Terzini ed esterni |
| ⚽ | **Centrocampo** | Mediani, mezzale, trequartisti |
| 🦅 | **Ala** | Ali e esterni offensivi |
| 🎯 | **Attaccante** | Punte e seconde punte |

---

## 🔄 Mappatura Posizioni Transfermarkt → Ruoli Generali

### 🥅 Portiere
- Portiere
- Porta
- Goalkeeper

### 🛡️ Difensore
- Difesa - Difensore centrale
- Difensore centrale
- Centre-Back
- Center-Back

### ↔️ Terzino
- Difesa - Terzino sinistro/destro
- Terzino sinistro/destro
- Left-Back / Right-Back
- Esterno sinistro/destro
- Esterno di sinistra/destra
- Left Wing-Back / Right Wing-Back

### ⚽ Centrocampo
- Centrocampo - Mediano
- Centrocampo - Centrocampista
- Centrocampo - Trequartista
- Mediano
- Mezzala sinistra/destra
- Trequartista
- Defensive Midfield
- Central Midfield
- Attacking Midfield

### 🦅 Ala
- Attacco - Ala sinistra/destra
- Ala sinistra/destra
- Left Winger / Right Winger

### 🎯 Attaccante
- Attacco - Attaccante
- Attacco - Punta centrale
- Attacco - Seconda punta
- Attaccante
- Punta
- Centre-Forward
- Striker
- Second Striker

---

## 🏷️ Abbreviazioni Posizioni

Il campo `specific_position` viene convertito in abbreviazione:

### Portieri
- **POR** - Portiere

### Difesa
- **DC** - Difensore Centrale
- **DCS** - Difensore Centrale Sinistro
- **DCD** - Difensore Centrale Destro
- **TS** - Terzino Sinistro
- **TD** - Terzino Destro
- **ES** - Esterno Sinistro
- **ED** - Esterno Destro

### Centrocampo
- **MED** - Mediano
- **MS** - Mediano Sinistro
- **MD** - Mediano Destro
- **CC** - Centrocampista Centrale
- **CS** - Centrocampista Sinistro
- **CD** - Centrocampista Destro
- **MZS** - Mezzala Sinistra
- **MZD** - Mezzala Destra
- **TRQ** - Trequartista
- **TRS** - Trequartista Sinistro
- **TRD** - Trequartista Destro

### Attacco
- **AS** - Ala Sinistra
- **AD** - Ala Destra
- **SP** - Seconda Punta
- **SPS** - Seconda Punta Sinistra
- **SPD** - Seconda Punta Destra
- **ATT** - Attaccante
- **ATS** - Attaccante Sinistro
- **ATD** - Attaccante Destro

---

## 📝 Esempio Completo: James Penrice

### Input da Transfermarkt
```
Nome: James Penrice
Posizione: Difesa - Terzino sinistro
Posizione naturale: Terzino sinistro
Altre posizioni: Esterno di sinistra
```

### Output nel Database
```json
{
  "name": "James Penrice",
  "general_role": "Terzino",
  "specific_position": "TS",
  "natural_position": "TS",
  "other_positions": "ES",
  "position_full_name": "Difesa - Terzino sinistro",
  "natural_position_full_name": "Terzino sinistro",
  "other_positions_full_name": "Esterno di sinistra",
  "priority": null,
  "director_feedback": null,
  "check_type": null,
  "notes": null
}
```

**Nota**: I campi `priority`, `director_feedback`, `check_type` e `notes` sono lasciati vuoti (`null`) e devono essere compilati manualmente dallo scout.

### Visualizzazione nel Campo Tattico
- **Pallino principale** (blu): **TS**
- **Pallino naturale** (bianco): **TS**
- **Pallino alternativo** (grigio): **ES**

---

## ✅ Test Giocatori Reali

| Giocatore | Posizione TM | Ruolo Generale | Abbreviazione |
|-----------|--------------|----------------|---------------|
| Donnarumma | Porta | **Portiere** | POR |
| Van Dijk | Difesa - Difensore centrale | **Difensore** | DC |
| Penrice | Difesa - Terzino sinistro | **Terzino** | TS |
| Bellingham | Centrocampo - Trequartista | **Centrocampo** | TRQ |
| Vinicius Jr | Attacco - Ala sinistra | **Ala** | AS |
| Haaland | Attacco - Punta centrale | **Attaccante** | ATT |

---

## 🧪 Eseguire i Test

```bash
# Test abbreviazioni
python test_role_abbreviations.py

# Test ruoli generali
python test_general_roles.py

# Test con giocatori reali
./test_real_players.sh
```

---

## 📁 File Coinvolti

- **Backend**: `transfermarkt_scraper.py`
  - `map_position_to_role()` - Mappa posizione → ruolo generale
  - `get_role_abbreviation()` - Mappa posizione → abbreviazione
  - `map_to_database_format()` - Converte dati TM → formato DB

- **Frontend**: `scouting-app/src/components/`
  - `PlayerDetailCardFM.js` - Visualizza abbreviazioni nel campo tattico
  - `PlayerForm.js` - Form di importazione
  - `PlayerCompactCard.js` - Card compatta giocatore

---

## 🔧 Manutenzione

Se Transfermarkt introduce nuove posizioni:

1. Aggiungi la mappatura in `map_position_to_role()`
2. Aggiungi l'abbreviazione in `get_role_abbreviation()`
3. Esegui i test per verificare
4. Aggiorna questa documentazione
