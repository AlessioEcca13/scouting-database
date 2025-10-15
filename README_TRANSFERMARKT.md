# 🌐 Integrazione Transfermarkt - Scouting Database

> **Importa automaticamente i dati dei giocatori da Transfermarkt nel tuo database di scouting**

---

## 🎯 Cosa Fa

Questa integrazione ti permette di:
1. **Incollare** un link Transfermarkt nel form "Aggiungi Giocatore"
2. **Cliccare** "Importa"
3. **Vedere** tutti i campi compilati automaticamente

**Risparmio tempo: da 10 minuti a 30 secondi per giocatore!** ⚡

---

## 🚀 Quick Start (2 Comandi)

### 1. Avvia l'API (Terminale 1)
```bash
python3 api_scraper.py
```

### 2. Avvia il Frontend (Terminale 2)
```bash
cd frontend && npm start
```

### 3. Usa l'App
1. Apri http://localhost:3000
2. Clicca "➕ Aggiungi Giocatore"
3. Incolla: `https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497`
4. Clicca "🔍 Importa"
5. ✨ Magia!

---

## 📊 Dati Importati Automaticamente

✅ Nome completo  
✅ Squadra attuale  
✅ Nazionalità  
✅ Altezza (cm)  
✅ Posizione/Ruolo  
✅ Piede preferito  
✅ Valore di mercato  
✅ Link Transfermarkt  
✅ Note dettagliate  

---

## 📁 File Principali

| File | Descrizione |
|------|-------------|
| `transfermarkt_scraper.py` | Scraper Python |
| `api_scraper.py` | API REST Flask |
| `frontend/src/components/AddPlayerForm.js` | Form React modificato |
| `test_api.sh` | Script di test |

---

## 📚 Documentazione

- **[QUICK_START.md](QUICK_START.md)** - Inizia subito (2 minuti)
- **[CONSEGNA_FINALE.md](CONSEGNA_FINALE.md)** - Panoramica completa
- **[TRANSFERMARKT_INTEGRATION.md](TRANSFERMARKT_INTEGRATION.md)** - Dettagli tecnici
- **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - Riepilogo sviluppo

---

## 🧪 Test

```bash
# Test automatico
./test_api.sh

# Test manuale API
curl http://localhost:5001/health

# Test scraping
curl -X POST http://localhost:5001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497"}'
```

---

## 🎨 Screenshot

### Prima
```
[ ] Nome: _____________
[ ] Squadra: __________
[ ] Nazionalità: ______
... (10+ campi vuoti)
```

### Dopo
```
[x] Nome: Filipe Relvas
[x] Squadra: AEK Atene
[x] Nazionalità: Portogallo
... (10+ campi compilati!)
```

---

## ⚙️ Requisiti

```bash
# Python
pip install flask flask-cors requests beautifulsoup4 lxml

# Node.js (già installato)
cd frontend && npm install
```

---

## 🔧 Troubleshooting

**API non risponde?**
```bash
python3 api_scraper.py
```

**Frontend non si avvia?**
```bash
cd frontend && npm start
```

**Errore CORS?**
- Verifica che l'API usi porta 5001
- CORS è già abilitato

---

## 📈 Status

🟢 **PRODUCTION READY**

- ✅ Scraper testato
- ✅ API funzionante
- ✅ Form integrato
- ✅ Documentazione completa

---

## 🎯 Esempi URL

```
https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497
https://www.transfermarkt.it/erling-haaland/profil/spieler/418560
https://www.transfermarkt.it/kylian-mbappe/profil/spieler/342229
```

---

## 💡 Tips

- L'API deve essere attiva prima di usare il frontend
- Usa la porta 5001 (5000 è occupata da AirPlay su macOS)
- I dati vengono estratti in tempo reale da Transfermarkt
- Puoi modificare i dati importati prima di salvare

---

## 📞 Help

Leggi la documentazione completa:
- `QUICK_START.md` per iniziare
- `CONSEGNA_FINALE.md` per la panoramica
- `TRANSFERMARKT_INTEGRATION.md` per i dettagli tecnici

---

**Creato:** 10 Ottobre 2025  
**Status:** ✅ Completato e Testato  
**Versione:** 1.0.0

---

🎉 **Buon scouting!** ⚽
