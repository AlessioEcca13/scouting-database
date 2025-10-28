# 🚀 Avvio API Transfermarkt Scraper

## ⚠️ IMPORTANTE: Riavvio Necessario Dopo Modifiche

**Ogni volta che modifichi `transfermarkt_scraper.py` o `api_scraper.py`, DEVI riavviare l'API!**

Python carica i moduli all'avvio, quindi le modifiche al codice non vengono applicate fino al riavvio.

## 🔄 Riavvio Rapido dell'API

```bash
# 1. Termina il processo esistente sulla porta 5001
lsof -ti:5001 | xargs kill -9 2>/dev/null

# 2. Avvia la nuova versione
python3 api_scraper.py
```

## Installazione Dipendenze (Prima Volta)

```bash
# Dalla root del progetto
pip install -r requirements.txt
```

## Avvio Server (Prima Volta)

```bash
# Dalla root del progetto
python3 api_scraper.py
```

Il server sarà disponibile su **http://localhost:5001**

## ✅ Verifica Funzionamento

Dopo il riavvio, verifica che i dati siano corretti:

```bash
curl -s -X POST http://localhost:5001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.transfermarkt.es/james-penrice/profil/spieler/363227"}' | \
  python3 -c "import json, sys; db = json.load(sys.stdin)['db_format']; print(f\"✅ general_role: {db['general_role']}\"); print(f\"✅ specific_position: {db['specific_position']}\"); print(f\"✅ preferred_foot: {db['preferred_foot']}\")"
```

**Output atteso:**
```
✅ general_role: Terzino
✅ specific_position: LB
✅ preferred_foot: Left
```

## 🌍 Supporto Multilingua

L'API supporta link Transfermarkt da **tutti i paesi**:
- 🇮🇹 Italia: `transfermarkt.it`
- 🇬🇧 UK: `transfermarkt.com`, `transfermarkt.co.uk`
- 🇪🇸 Spagna: `transfermarkt.es`
- 🇫🇷 Francia: `transfermarkt.fr`
- 🇩🇪 Germania: `transfermarkt.de`

Tutti i dati vengono automaticamente convertiti in **inglese** per il database.

## Utilizzo nell'App

1. **Avvia il server API**: `python3 api_scraper.py`
2. **Avvia l'app React**: `cd scouting-app && npm start`
3. **Vai su "Add Player"**
4. **Incolla un link Transfermarkt** (qualsiasi lingua)
5. **Clicca "Import from Transfermarkt"**
6. I dati vengono compilati automaticamente in inglese

## Endpoint Disponibili

- **POST /api/scrape** - Scraping dati giocatore (JSON body)
- **GET /api/scrape-url** - Scraping dati giocatore (query param)

## Campi Compilati Automaticamente

L'importazione da Transfermarkt compila:
- ✅ Nome, anno nascita, luogo nascita
- ✅ Nazionalità
- ✅ Altezza, peso
- ✅ Ruolo generale (**sempre in inglese**)
- ✅ Posizione specifica (**abbreviazione inglese**: LB, CB, ST, etc.)
- ✅ Piede preferito (**sempre in inglese**: Right, Left, Both)
- ✅ Squadra attuale
- ✅ Valore di mercato (formato: "2.00 mln €")
- ✅ Scadenza contratto
- ✅ Numero maglia
- ✅ Immagine profilo

## Campi da Compilare Manualmente

I seguenti campi devono essere compilati dallo scout:
- **Priority** (Priorità)
- **Director Feedback** (Raccomandazione DS)
- **Check Type** (Tipo di controllo)
- **Notes** (Note dello scout)
- **Strong Points** (Punti di forza)
- **Weak Points** (Punti deboli)
- **Final Rating** (Valutazione finale)

## Risoluzione Problemi

### I dati non vengono importati nell'app

**SOLUZIONE**: Riavvia l'API!

```bash
lsof -ti:5001 | xargs kill -9 2>/dev/null
python3 api_scraper.py
```

### Dati in lingua sbagliata o abbreviazioni errate

**SOLUZIONE**: Hai modificato il codice Python ma non hai riavviato l'API.

```bash
# Riavvia l'API
lsof -ti:5001 | xargs kill -9 2>/dev/null
python3 api_scraper.py
```

### Errore "Connection refused"

- Assicurati che l'API sia in esecuzione
- Verifica che il frontend stia chiamando `http://localhost:5001`

### L'API non si avvia

```bash
# Verifica se la porta è già in uso
lsof -i :5001

# Termina il processo esistente
kill -9 $(lsof -t -i:5001)

# Riavvia
python3 api_scraper.py
```

## Note

- Il server deve essere in esecuzione mentre usi la funzione di import
- Usa CTRL+C per fermare il server
- Il server supporta CORS per permettere richieste da localhost:3000
- Debug mode abilitato per sviluppo
- **Ricorda di riavviare dopo ogni modifica al codice Python!**
