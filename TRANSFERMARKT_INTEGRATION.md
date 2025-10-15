# 🌐 Integrazione Transfermarkt Scraper

## 📋 Panoramica

Sistema completo per importare automaticamente i dati dei giocatori da Transfermarkt nel form "Aggiungi Giocatore".

### Componenti

1. **`transfermarkt_scraper.py`** - Scraper Python per estrarre dati da Transfermarkt
2. **`api_scraper.py`** - API Flask REST per esporre lo scraper
3. **`AddPlayerForm.js`** - Form React modificato con integrazione Transfermarkt

---

## 🚀 Setup e Installazione

### 1. Installa le dipendenze Python

```bash
cd /Users/alessioecca/windsurf/scouting_database

# Attiva virtual environment (se presente)
source .venv/bin/activate

# Installa dipendenze
pip install -r requirements.txt
```

### 2. Avvia l'API Flask

```bash
python3 api_scraper.py
```

L'API sarà disponibile su: **http://localhost:5000**

Output atteso:
```
======================================================================
🚀 TRANSFERMARKT SCRAPER API
======================================================================

API in esecuzione su: http://localhost:5000

Endpoints disponibili:
  GET  /health              - Health check
  POST /api/scrape          - Scrape player (JSON body)
  GET  /api/scrape-url      - Scrape player (query param)
```

### 3. Avvia il frontend React

In un altro terminale:

```bash
cd frontend
npm start
```

---

## 💡 Come Usare

### Nel Form "Aggiungi Giocatore"

1. Clicca su **"➕ Nuovo Giocatore"**
2. Nella sezione **"Importa da Transfermarkt"**:
   - Incolla il link del profilo Transfermarkt
   - Esempio: `https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497`
3. Clicca su **"🔍 Importa"**
4. I campi del form verranno compilati automaticamente con:
   - Nome completo
   - Anno di nascita
   - Squadra attuale
   - Nazionalità
   - Altezza (cm)
   - Ruolo generale
   - Posizione specifica
   - Piede preferito
   - Valore di mercato
   - Scadenza contratto
   - Note (con informazioni dettagliate)

---

## 🔧 Endpoints API

### Health Check
```bash
curl http://localhost:5000/health
```

### Scrape Player (POST)
```bash
curl -X POST http://localhost:5000/api/scrape \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497"}'
```

### Scrape Player (GET)
```bash
curl "http://localhost:5000/api/scrape-url?url=https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497"
```

### Risposta JSON
```json
{
  "success": true,
  "data": {
    "id": "567497",
    "name": "Filipe Relvas",
    "birth_year": 1999,
    "height_cm": "192",
    "nationality_primary": "Portogallo",
    "position": "Difesa - Difensore centrale",
    "preferred_foot": "sinistro",
    "current_club": "AEK Atene",
    "market_value": "3,50 mln €",
    ...
  },
  "db_format": {
    "name": "Filipe Relvas",
    "birth_year": 1999,
    "team": "AEK Atene",
    "nationality": "Portogallo",
    "height": "192",
    "general_role": "Difensore",
    "specific_position": "Difesa - Difensore centrale",
    "preferred_foot": "Sinistro",
    ...
  }
}
```

---

## 📊 Dati Estratti

Lo scraper estrae i seguenti dati da Transfermarkt:

✅ **Informazioni Base**
- Nome completo (pulito, senza numero maglia)
- Anno di nascita
- Età
- Luogo di nascita

✅ **Caratteristiche Fisiche**
- Altezza (convertita in cm)
- Nazionalità (con supporto doppia cittadinanza)

✅ **Ruolo e Posizione**
- Posizione principale
- Ruolo specifico
- Piede preferito

✅ **Info Squadra**
- Squadra attuale
- Valore di mercato
- Scadenza contratto
- Numero di maglia

---

## 🛠️ Troubleshooting

### Errore: "API non raggiungibile"
- Verifica che l'API Flask sia in esecuzione su `localhost:5000`
- Controlla i log del terminale dove hai avviato `api_scraper.py`

### Errore: "ModuleNotFoundError"
```bash
pip install -r requirements.txt
```

### Errore CORS
- L'API ha CORS abilitato di default
- Se usi una porta diversa da 3000 per React, potrebbe essere necessario configurare CORS

### Dati non estratti correttamente
- Transfermarkt potrebbe aver cambiato la struttura HTML
- Controlla i log dell'API per vedere quali campi sono stati estratti
- Lo scraper stampa: `Campi estratti: name, height_cm, nationality_primary, position, preferred_foot`

---

## 🔄 Workflow Completo

```
1. Utente incolla link Transfermarkt nel form
                    ↓
2. Frontend React chiama API Flask (POST /api/scrape)
                    ↓
3. API Flask esegue scraping della pagina Transfermarkt
                    ↓
4. Scraper estrae dati e li mappa al formato database
                    ↓
5. API restituisce dati in formato JSON
                    ↓
6. Frontend auto-compila i campi del form
                    ↓
7. Utente può modificare/integrare i dati
                    ↓
8. Salvataggio nel database Supabase
```

---

## 📝 Note Tecniche

### Mapping Ruoli
Lo scraper mappa automaticamente i ruoli Transfermarkt al formato del database:

```python
'Centre-Back' → 'Difensore'
'Left-Back' / 'Right-Back' → 'Terzino'
'Defensive Midfield' / 'Central Midfield' → 'Centrocampo'
'Left Winger' / 'Right Winger' → 'Ala'
'Centre-Forward' / 'Second Striker' → 'Attaccante'
```

### Mapping Piede
```python
'right' / 'destro' → 'Destro'
'left' / 'sinistro' → 'Sinistro'
'both' / 'entrambi' → 'Ambidestro'
```

---

## 🎯 Esempi di URL Transfermarkt

```
https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497
https://www.transfermarkt.it/erling-haaland/profil/spieler/418560
https://www.transfermarkt.it/kylian-mbappe/profil/spieler/342229
https://www.transfermarkt.it/jude-bellingham/profil/spieler/581678
```

---

## ⚡ Performance

- Tempo medio di scraping: **2-4 secondi**
- Rate limiting: Nessuno (usa con moderazione)
- Cache: Non implementata (ogni richiesta fa scraping live)

---

## 🔐 Sicurezza

- L'API è configurata per accettare solo richieste da localhost
- Per deployment in produzione, considera:
  - Autenticazione API
  - Rate limiting
  - Validazione URL più stringente
  - HTTPS

---

## 📚 Dipendenze

```
requests==2.31.0        # HTTP requests
beautifulsoup4==4.12.2  # HTML parsing
lxml==4.9.3             # XML/HTML parser
flask==3.0.0            # Web framework
flask-cors==4.0.0       # CORS support
```

---

## 🐛 Debug

Per vedere i dati estratti in dettaglio, controlla i log dell'API:

```bash
python3 api_scraper.py
```

Output di debug:
```
📥 Scaricamento dati per giocatore ID: 567497
✅ Dati estratti con successo per Filipe Relvas
   Campi estratti: name, height_cm, nationality_primary, position, preferred_foot
```

---

## 📄 Licenza

Uso interno per scouting database. Rispetta i termini di servizio di Transfermarkt.
