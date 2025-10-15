# 🚀 Quick Start - Integrazione Transfermarkt

## ✅ Setup Completato

L'integrazione Transfermarkt è stata configurata con successo! Ecco come usarla:

---

## 📝 Uso Rapido

### 1. Avvia l'API Flask (Terminale 1)

```bash
cd /Users/alessioecca/windsurf/scouting_database
python3 api_scraper.py
```

✅ L'API sarà disponibile su: **http://localhost:5001**

### 2. Avvia il Frontend React (Terminale 2)

```bash
cd /Users/alessioecca/windsurf/scouting_database/frontend
npm start
```

✅ Il frontend sarà disponibile su: **http://localhost:3000**

### 3. Usa l'Integrazione

1. Apri l'app React nel browser
2. Clicca su **"➕ Aggiungi Giocatore"**
3. Nella sezione **"🌐 Importa da Transfermarkt"**:
   - Incolla un link Transfermarkt (es: `https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497`)
   - Clicca **"🔍 Importa"**
4. I campi del form si compileranno automaticamente! ✨

---

## 🎯 Cosa Viene Importato

✅ **Dati Automatici:**
- Nome completo
- Squadra attuale
- Nazionalità
- Altezza (in cm)
- Posizione/Ruolo
- Piede preferito
- Valore di mercato
- Link Transfermarkt
- Note dettagliate

---

## 🧪 Test Rapido

Testa l'API con:

```bash
./test_api.sh
```

Oppure manualmente:

```bash
curl http://localhost:5001/health
```

---

## 📊 Esempio URL Transfermarkt

Prova con questi giocatori:

```
https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497
https://www.transfermarkt.it/erling-haaland/profil/spieler/418560
https://www.transfermarkt.it/kylian-mbappe/profil/spieler/342229
```

---

## 🔧 Troubleshooting

### ❌ "API non raggiungibile"
- Verifica che `python3 api_scraper.py` sia in esecuzione
- Controlla che usi la porta **5001** (non 5000)

### ❌ "ModuleNotFoundError"
```bash
pip install flask flask-cors requests beautifulsoup4 lxml
```

### ❌ "CORS error"
- L'API ha CORS abilitato di default
- Assicurati che il frontend usi `localhost:5001`

---

## 📁 File Creati/Modificati

### Nuovi File:
- ✅ `transfermarkt_scraper.py` - Scraper Python corretto
- ✅ `api_scraper.py` - API Flask REST
- ✅ `requirements.txt` - Dipendenze Python
- ✅ `test_api.sh` - Script di test
- ✅ `TRANSFERMARKT_INTEGRATION.md` - Documentazione completa

### File Modificati:
- ✅ `frontend/src/components/AddPlayerForm.js` - Integrazione UI

---

## 🎉 Pronto!

L'integrazione è completa e funzionante. Buon scouting! ⚽

Per dettagli tecnici completi, vedi: `TRANSFERMARKT_INTEGRATION.md`
