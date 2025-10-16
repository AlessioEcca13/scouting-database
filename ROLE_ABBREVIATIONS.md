# 🎯 Abbreviazioni Ruoli - Transfermarkt → Campo Tattico

## Mappatura Completa

Quando importi un giocatore da Transfermarkt, il sistema converte automaticamente la posizione in un'abbreviazione per il campo tattico.

### 🟡 Portieri
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Portiere | **POR** |
| Goalkeeper | **POR** |

### 🔵 Difensori

#### Difensori Centrali
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Difensore centrale | **DC** |
| Centre-Back | **DC** |
| Difensore centrale sinistro | **DCS** |
| Difensore centrale destro | **DCD** |

#### Terzini
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Terzino sinistro | **TS** |
| Left-Back | **TS** |
| Terzino destro | **TD** |
| Right-Back | **TD** |

#### Esterni (Wing-Back)
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Esterno sinistro | **ES** |
| Esterno di sinistra | **ES** |
| Left Wing-Back | **ES** |
| Esterno destro | **ED** |
| Esterno di destra | **ED** |
| Right Wing-Back | **ED** |

### 🟢 Centrocampisti

#### Mediani
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Mediano | **MED** |
| Defensive Midfield | **MED** |
| Mediano sinistro | **MS** |
| Mediano destro | **MD** |

#### Centrocampisti Centrali
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Centrocampista | **CC** |
| Central Midfield | **CC** |
| Centrocampista sinistro | **CS** |
| Centrocampista destro | **CD** |

#### Mezzali
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Mezzala sinistra | **MZS** |
| Mezzala destra | **MZD** |

#### Trequartisti
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Trequartista | **TRQ** |
| Attacking Midfield | **TRQ** |
| Trequartista sinistro | **TRS** |
| Trequartista destro | **TRD** |

### 🔴 Attaccanti

#### Ali
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Ala sinistra | **AS** |
| Left Winger | **AS** |
| Ala destra | **AD** |
| Right Winger | **AD** |

#### Seconde Punte
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Seconda punta | **SP** |
| Second Striker | **SP** |
| Seconda punta sinistra | **SPS** |
| Seconda punta destra | **SPD** |

#### Attaccanti/Punte
| Transfermarkt | Abbreviazione |
|---------------|---------------|
| Attaccante | **ATT** |
| Centre-Forward | **ATT** |
| Striker | **ATT** |
| Punta | **ATT** |
| Attaccante sinistro | **ATS** |
| Attaccante destro | **ATD** |

## 📊 Esempio: James Penrice

Quando importi James Penrice da Transfermarkt:

```json
{
  "name": "James Penrice",
  "specific_position": "Difesa - Terzino sinistro",
  "position_abbr": "TS",
  "natural_position": "Terzino sinistro",
  "natural_position_abbr": "TS",
  "other_positions": "Esterno di sinistra",
  "other_positions_abbr": "ES"
}
```

Nel campo tattico vedrai:
- **Posizione principale**: pallino blu con **TS**
- **Posizione naturale**: pallino bianco con **TS**
- **Altre posizioni**: pallino grigio con **ES**

## 🔧 Implementazione

Le abbreviazioni sono gestite dalla funzione `get_role_abbreviation()` in:
- **Backend**: `transfermarkt_scraper.py`
- **Frontend**: `PlayerDetailCardFM.js`

## ✅ Test

Esegui i test con:
```bash
python test_role_abbreviations.py
```

Tutti i 26 test devono passare! ✅
