# 🚀 Avvio Server API per Transfermarkt

## Installazione Dipendenze

```bash
# Dalla root del progetto
pip install -r requirements.txt
```

## Avvio Server

```bash
# Dalla root del progetto
python api_scraper.py
```

Il server sarà disponibile su **http://localhost:5001**

## Endpoint Disponibili

- **POST /api/scrape** - Scraping dati giocatore da Transfermarkt (JSON body)
- **GET /api/scrape-url** - Scraping dati giocatore (query param)
- **GET /health** - Health check del server

## Test

```bash
# Test health check
curl http://localhost:5001/health

# Test scraping (POST)
curl -X POST http://localhost:5001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.transfermarkt.it/james-penrice/profil/spieler/363227"}'

# Test scraping (GET)
curl "http://localhost:5001/api/scrape-url?url=https://www.transfermarkt.it/james-penrice/profil/spieler/363227"
```

## Utilizzo nell'App

1. Avvia il server API: `python api_scraper.py`
2. Avvia l'app React: `cd scouting-app && npm start`
3. Usa il pulsante "Importa da Transfermarkt" nel form giocatore

## File del Progetto

- **`api_scraper.py`** - Server Flask con API REST
- **`transfermarkt_scraper.py`** - Logica di scraping
- **`test_scraper_height_weight.py`** - Test per verificare estrazione dati

## Note

- Il server deve essere in esecuzione mentre usi la funzione di import
- Usa CTRL+C per fermare il server
- Il server supporta CORS per permettere richieste da localhost:3000
- Debug mode abilitato per sviluppo

## Campi Compilati Automaticamente

L'importazione da Transfermarkt compila automaticamente:
- Dati anagrafici (nome, anno nascita, nazionalità)
- Dati fisici (altezza, peso)
- Dati tecnici (ruolo, posizione, piede preferito)
- Dati contrattuali (squadra, valore, scadenza contratto)

## Campi da Compilare Manualmente

I seguenti campi sono lasciati vuoti e devono essere compilati dallo scout:
- **Priority** (Priorità)
- **Director Feedback** (Raccomandazione DS)
- **Check Type** (Tipo di controllo)
- **Notes** (Note dello scout)
