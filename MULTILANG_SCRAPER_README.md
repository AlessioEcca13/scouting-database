# 🌍 Transfermarkt Multilingual Scraper

Scraper avanzato per estrarre dati da Transfermarkt in **qualsiasi lingua** con **traduzione automatica in inglese**.

## ✨ Caratteristiche

- ✅ **Supporto multilingua**: Italiano, Spagnolo, Tedesco, Inglese, Francese, Portoghese
- ✅ **Traduzione automatica**: Tutti i dati vengono tradotti in inglese
- ✅ **Dizionari manuali**: Traduzioni accurate per ruoli e termini calcistici
- ✅ **Rilevamento automatico lingua**: Dalla URL
- ✅ **Parsing intelligente**: Gestisce formati diversi per ogni lingua
- ✅ **Consistenza dati**: Stesso formato output indipendentemente dalla lingua di input

## 📦 Installazione

```bash
# Installa dipendenze
pip install -r requirements_scraper.txt

# Oppure manualmente
pip install requests beautifulsoup4 lxml deep-translator
```

## 🚀 Utilizzo

### Esempio Base

```python
from transfermarkt_multilang_scraper import MultiLangTransfermarktScraper

scraper = MultiLangTransfermarktScraper()

# Funziona con URL in QUALSIASI lingua
urls = [
    "https://www.transfermarkt.it/james-penrice/profil/spieler/363227",  # Italiano
    "https://www.transfermarkt.es/james-penrice/profil/spieler/363227",  # Spagnolo
    "https://www.transfermarkt.de/james-penrice/profil/spieler/363227",  # Tedesco
    "https://www.transfermarkt.co.uk/james-penrice/profil/spieler/363227", # Inglese
]

for url in urls:
    data = scraper.get_player_info(url)
    print(data)
    # Tutti i dati saranno in INGLESE!
```

### Output Esempio

```json
{
  "player_id": "363227",
  "name": "James Penrice",
  "position": "Left-Back",
  "natural_position": "Left-Back",
  "other_positions": "Left Wing-Back",
  "nationality_primary": "Scotland",
  "preferred_foot": "left",
  "height_cm": 180,
  "birth_year": 1998,
  "age": 26,
  "team": "AEK Athens",
  "market_value": 2000000.0,
  "contract_expiry": "2027",
  "profile_image": "https://...",
  "source_language": "it"
}
```

## 🧪 Test

```bash
# Test completo con diverse lingue
python test_multilang_scraper.py

# Test rapido
python transfermarkt_multilang_scraper.py
```

## 🌐 Lingue Supportate

| Lingua | Dominio | Codice |
|--------|---------|--------|
| Italiano | transfermarkt.it | it |
| Spagnolo | transfermarkt.es | es |
| Tedesco | transfermarkt.de | de |
| Inglese | transfermarkt.co.uk | en |
| Francese | transfermarkt.fr | fr |
| Portoghese | transfermarkt.pt | pt |

## 📊 Campi Estratti

### Informazioni Base
- `name`: Nome completo
- `player_id`: ID Transfermarkt
- `birth_year`: Anno di nascita
- `age`: Età attuale
- `height_cm`: Altezza in cm

### Ruolo e Posizione
- `position`: Posizione principale (tradotta)
- `natural_position`: Ruolo naturale (tradotto)
- `other_positions`: Altri ruoli (tradotti)

### Dettagli
- `nationality_primary`: Nazionalità (tradotta)
- `preferred_foot`: Piede preferito (left/right/both)
- `team`: Squadra attuale (tradotta)
- `market_value`: Valore di mercato in €
- `contract_expiry`: Scadenza contratto (anno)
- `profile_image`: URL immagine profilo

### Metadata
- `url`: URL originale
- `source_language`: Lingua rilevata

## 🎯 Traduzioni Ruoli

Lo scraper usa **dizionari manuali** per i ruoli più comuni, garantendo traduzioni accurate:

### Esempi

| Italiano | Spagnolo | Tedesco | Inglese |
|----------|----------|---------|---------|
| Portiere | Portero | Torwart | Goalkeeper |
| Terzino sinistro | Lateral izquierdo | Linker Verteidiger | Left-Back |
| Mediano | Pivote | Defensives Mittelfeld | Defensive Midfield |
| Trequartista | Mediapunta | Offensives Mittelfeld | Attacking Midfield |
| Ala sinistra | Extremo izquierdo | Linksaußen | Left Winger |

## 🔧 Integrazione con Database

```python
from transfermarkt_multilang_scraper import MultiLangTransfermarktScraper

scraper = MultiLangTransfermarktScraper()

# Estrai dati (da qualsiasi lingua)
data = scraper.get_player_info(url)

# Mappa al formato database
db_data = {
    'name': data['name'],
    'birth_year': data.get('birth_year'),
    'height_cm': data.get('height_cm'),
    'nationality_primary': data.get('nationality_primary'),
    'general_role': map_position_to_general_role(data.get('position')),
    'specific_position': map_to_abbreviation(data.get('natural_position')),
    'other_positions': map_to_abbreviation(data.get('other_positions')),
    'preferred_foot': data.get('preferred_foot'),
    'team': data.get('team'),
    'market_value': data.get('market_value'),
    'contract_expiry': data.get('contract_expiry'),
    'profile_image': data.get('profile_image'),
}

# Salva nel database
# insert_into_supabase(db_data)
```

## ⚙️ Metodologia

### 1. Rilevamento Lingua
```python
# Automatico dal dominio URL
transfermarkt.it → Italiano
transfermarkt.es → Spagnolo
transfermarkt.de → Tedesco
```

### 2. Estrazione Dati
- Parsing HTML con BeautifulSoup
- Regex multilingua per campi numerici
- Gestione formati diversi per ogni lingua

### 3. Traduzione
```python
# Priorità:
1. Dizionario manuale (ruoli, piede, etc.)
2. Google Translate API (nomi squadre, nazionalità)
3. Fallback: testo originale
```

### 4. Normalizzazione
- Tutti i testi in inglese
- Formati numerici standardizzati
- Valute convertite in €

## 🐛 Troubleshooting

### Errore: "No module named 'deep_translator'"
```bash
pip install deep-translator
```

### Errore: "Translation failed"
- Verifica connessione internet
- Google Translate potrebbe essere temporaneamente non disponibile
- I dati verranno salvati in lingua originale

### Traduzioni inconsistenti
- I dizionari manuali coprono i casi più comuni
- Per ruoli rari, viene usata traduzione automatica
- Puoi aggiungere traduzioni manuali in `POSITION_TRANSLATIONS`

## 📝 Note

- **Rate Limiting**: Transfermarkt potrebbe bloccare richieste troppo frequenti
- **Traduzioni**: Google Translate è gratuito ma ha limiti di utilizzo
- **Consistenza**: Stesso giocatore da lingue diverse → dati identici in inglese
- **Performance**: Prima richiesta più lenta (inizializzazione traduttore)

## 🔄 Workflow Consigliato

1. **Input**: URL Transfermarkt (qualsiasi lingua)
2. **Scraping**: Estrazione dati con `get_player_info()`
3. **Traduzione**: Automatica in inglese
4. **Mapping**: Converti ruoli in abbreviazioni database
5. **Salvataggio**: Inserisci in Supabase

```python
# Esempio completo
url = "https://www.transfermarkt.es/lionel-messi/profil/spieler/28003"
data = scraper.get_player_info(url)  # Dati in inglese
db_data = map_to_database_format(data)  # Abbreviazioni
save_to_supabase(db_data)  # Salva
```

## 🎓 Vantaggi

✅ **Universale**: Funziona con qualsiasi lingua di Transfermarkt  
✅ **Consistente**: Dati sempre in inglese nel database  
✅ **Accurato**: Dizionari manuali per termini calcistici  
✅ **Automatico**: Nessuna configurazione manuale richiesta  
✅ **Scalabile**: Aggiungi nuove lingue facilmente  

## 📚 Esempi Avanzati

### Batch Processing
```python
urls = [
    "https://www.transfermarkt.it/player1/profil/spieler/123",
    "https://www.transfermarkt.es/player2/profil/spieler/456",
    "https://www.transfermarkt.de/player3/profil/spieler/789",
]

scraper = MultiLangTransfermarktScraper()
results = []

for url in urls:
    data = scraper.get_player_info(url)
    if 'error' not in data:
        results.append(data)
    time.sleep(2)  # Rate limiting
```

### Comparazione Multilingua
```python
# Verifica che stesso giocatore in lingue diverse dia dati identici
urls_same_player = [
    "https://www.transfermarkt.it/player/profil/spieler/123",
    "https://www.transfermarkt.es/player/profil/spieler/123",
]

data_it = scraper.get_player_info(urls_same_player[0])
data_es = scraper.get_player_info(urls_same_player[1])

assert data_it['position'] == data_es['position']  # Entrambi in inglese!
```

## 🚀 Prossimi Sviluppi

- [ ] Cache traduzioni per performance
- [ ] Supporto altre lingue (russo, turco, arabo)
- [ ] Batch API per traduzioni multiple
- [ ] Fallback offline con dizionari completi
- [ ] Validazione automatica traduzioni

---

**Autore**: Scouting Database Team  
**Versione**: 1.0.0  
**Licenza**: MIT
