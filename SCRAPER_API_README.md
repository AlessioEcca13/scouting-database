# 🚀 Transfermarkt Scraper API

API REST per lo scraper multilingua Transfermarkt.

## 📡 Server

**URL Base**: `http://localhost:5001`

**Avvio Server**:
```bash
python3 scraper_api.py
```

Output:
```
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
TRANSFERMARKT SCRAPER API SERVER
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

📍 Server running on: http://localhost:5001
📡 Endpoint: POST http://localhost:5001/api/scrape
🏥 Health check: GET http://localhost:5001/api/health
```

---

## 🔌 Endpoints

### 1. Health Check

**GET** `/api/health`

Verifica che il server sia attivo.

**Response**:
```json
{
  "status": "ok",
  "message": "Transfermarkt Scraper API is running",
  "version": "1.0.0"
}
```

**Esempio**:
```bash
curl http://localhost:5001/api/health
```

---

### 2. Scrape Player

**POST** `/api/scrape`

Estrae dati da URL Transfermarkt (qualsiasi lingua).

**Request Body**:
```json
{
  "url": "https://www.transfermarkt.es/james-penrice/profil/spieler/363227"
}
```

**Response Success**:
```json
{
  "success": true,
  "message": "Dati estratti con successo per James Penrice",
  "data": {
    "name": "James Penrice",
    "birth_year": 1998,
    "age": 26,
    "height_cm": 180,
    "nationality_primary": "Scotland",
    "general_role": "Difensore",
    "specific_position": "TS",
    "other_positions": "AS",
    "preferred_foot": "left",
    "team": "AEK Athens",
    "market_value": 2000000.0,
    "contract_expiry": "2027",
    "profile_image": "https://...",
    "transfermarkt_id": "363227",
    "transfermarkt_url": "https://...",
    "source_language": "es"
  }
}
```

**Response Error**:
```json
{
  "success": false,
  "error": "Messaggio di errore",
  "details": "Stack trace (solo in debug)"
}
```

**Esempio cURL**:
```bash
curl -X POST http://localhost:5001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.transfermarkt.es/player/profil/spieler/123"}'
```

**Esempio JavaScript**:
```javascript
const response = await fetch('http://localhost:5001/api/scrape', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.transfermarkt.es/james-penrice/profil/spieler/363227'
  })
});

const result = await response.json();

if (result.success) {
  console.log('Dati giocatore:', result.data);
} else {
  console.error('Errore:', result.error);
}
```

---

### 3. Supported Languages

**GET** `/api/supported-languages`

Restituisce le lingue supportate.

**Response**:
```json
{
  "languages": [
    {"code": "it", "name": "Italiano", "domain": "transfermarkt.it"},
    {"code": "es", "name": "Spagnolo", "domain": "transfermarkt.es"},
    {"code": "de", "name": "Tedesco", "domain": "transfermarkt.de"},
    {"code": "en", "name": "Inglese", "domain": "transfermarkt.co.uk"},
    {"code": "fr", "name": "Francese", "domain": "transfermarkt.fr"},
    {"code": "pt", "name": "Portoghese", "domain": "transfermarkt.pt"}
  ]
}
```

---

## 🌍 URL Supportati

Tutti i domini Transfermarkt sono supportati:

- 🇮🇹 `https://www.transfermarkt.it/player/profil/spieler/123`
- 🇪🇸 `https://www.transfermarkt.es/player/profil/spieler/123`
- 🇩🇪 `https://www.transfermarkt.de/player/profil/spieler/123`
- 🇬🇧 `https://www.transfermarkt.co.uk/player/profil/spieler/123`
- 🇫🇷 `https://www.transfermarkt.fr/player/profil/spieler/123`
- 🇵🇹 `https://www.transfermarkt.pt/player/profil/spieler/123`

**Note**:
- Parametri extra come `/fromCaptcha/1` vengono rimossi automaticamente
- L'ID giocatore deve essere presente nell'URL

---

## 📊 Campi Restituiti

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `name` | string | Nome completo |
| `birth_year` | int | Anno di nascita |
| `age` | int | Età attuale |
| `height_cm` | int | Altezza in cm |
| `nationality_primary` | string | Nazionalità (inglese) |
| `general_role` | string | Ruolo generale (italiano per UI) |
| `specific_position` | string | Abbreviazione posizione (TS, DC, etc.) |
| `other_positions` | string | Altre posizioni (abbreviazione) |
| `preferred_foot` | string | Piede preferito (left/right/both) |
| `team` | string | Squadra attuale (inglese) |
| `market_value` | float | Valore di mercato in € |
| `contract_expiry` | string | Anno scadenza contratto |
| `profile_image` | string | URL immagine profilo |
| `transfermarkt_id` | string | ID Transfermarkt |
| `transfermarkt_url` | string | URL originale |
| `source_language` | string | Lingua rilevata (it/es/de/en/fr/pt) |

---

## 🔧 Integrazione React

### PlayerForm.js

```javascript
const handleTransfermarktImport = async () => {
  try {
    setLoading(true);
    
    const response = await fetch('http://localhost:5001/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: transfermarktUrl
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Popola form con dati estratti
      setFormData({
        name: result.data.name,
        birth_year: result.data.birth_year,
        height_cm: result.data.height_cm,
        nationality_primary: result.data.nationality_primary,
        general_role: result.data.general_role,
        specific_position: result.data.specific_position,
        other_positions: result.data.other_positions,
        preferred_foot: result.data.preferred_foot,
        team: result.data.team,
        market_value: result.data.market_value,
        profile_image: result.data.profile_image,
      });
      
      toast.success(`✅ Dati importati per ${result.data.name}!`);
    } else {
      toast.error(`❌ Errore: ${result.error}`);
    }
  } catch (error) {
    console.error('Errore importazione:', error);
    toast.error('❌ Errore connessione al server scraper');
  } finally {
    setLoading(false);
  }
};
```

---

## ⚙️ Configurazione

### CORS

Il server ha CORS abilitato per permettere richieste da React:

```python
from flask_cors import CORS
CORS(app)
```

### Port

Default: `5001`

Per cambiare porta:
```python
app.run(port=5002)
```

### Debug Mode

Abilitato di default per sviluppo:
```python
app.run(debug=True)
```

Per produzione:
```python
app.run(debug=False)
```

---

## 🐛 Troubleshooting

### Errore: `ERR_CONNECTION_REFUSED`

**Causa**: Server non avviato

**Soluzione**:
```bash
python3 scraper_api.py
```

### Errore: `CORS policy`

**Causa**: CORS non configurato

**Soluzione**: Verifica che `flask-cors` sia installato:
```bash
pip install flask-cors
```

### Errore: `Failed to fetch`

**Causa**: URL non valido o Transfermarkt non raggiungibile

**Soluzione**: 
- Verifica URL Transfermarkt
- Controlla connessione internet
- Rimuovi parametri extra dall'URL

### Errore: `Translation failed`

**Causa**: Google Translate temporaneamente non disponibile

**Soluzione**: I dati verranno salvati in lingua originale

---

## 📝 Note

- **Rate Limiting**: Transfermarkt potrebbe bloccare troppe richieste
- **Timeout**: Richieste lunghe potrebbero andare in timeout
- **Captcha**: URL con `/fromCaptcha/` vengono puliti automaticamente
- **Traduzioni**: Dizionari manuali + Google Translate
- **Performance**: Prima richiesta più lenta (inizializzazione)

---

## 🚀 Deploy Produzione

### Gunicorn (consigliato)

```bash
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:5001 scraper_api:app
```

### Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements_scraper.txt .
RUN pip install -r requirements_scraper.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "scraper_api:app"]
```

---

## 📚 Esempi Completi

### Test con cURL

```bash
# Health check
curl http://localhost:5001/api/health

# Scrape italiano
curl -X POST http://localhost:5001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.transfermarkt.it/player/profil/spieler/123"}'

# Scrape spagnolo
curl -X POST http://localhost:5001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.transfermarkt.es/player/profil/spieler/123"}'

# Lingue supportate
curl http://localhost:5001/api/supported-languages
```

### Test con Python

```python
import requests

# Scrape
response = requests.post('http://localhost:5001/api/scrape', json={
    'url': 'https://www.transfermarkt.es/james-penrice/profil/spieler/363227'
})

data = response.json()

if data['success']:
    print(f"Nome: {data['data']['name']}")
    print(f"Posizione: {data['data']['specific_position']}")
else:
    print(f"Errore: {data['error']}")
```

---

**Autore**: Scouting Database Team  
**Versione**: 1.0.0  
**Licenza**: MIT
