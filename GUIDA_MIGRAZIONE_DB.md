# 🗄️ Guida Migrazione Database Supabase

## 📋 Come Aggiornare il Database

### ⚠️ IMPORTANTE
**NON ricreare la tabella!** Usa una migrazione per aggiungere le nuove colonne senza perdere i dati esistenti.

---

## 🚀 Procedura Passo-Passo

### 1. **Accedi a Supabase**
1. Vai su [supabase.com](https://supabase.com)
2. Accedi al tuo progetto
3. Clicca su **"SQL Editor"** nella sidebar sinistra

### 2. **Crea una Nuova Query**
1. Clicca su **"+ New query"**
2. Dai un nome: `add_transfermarkt_fields`

### 3. **Copia lo Script di Migrazione**
Copia il contenuto del file:
```
database/migration/add_transfermarkt_fields.sql
```

Oppure copia questo script:

```sql
-- AGGIUNGI NUOVE COLONNE
ALTER TABLE players ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS weight_kg INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS market_value_numeric DECIMAL(10,2);
ALTER TABLE players ADD COLUMN IF NOT EXISTS market_value_updated VARCHAR(20);
ALTER TABLE players ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS natural_position VARCHAR(100);
ALTER TABLE players ADD COLUMN IF NOT EXISTS other_positions TEXT;

-- AGGIUNGI COMMENTI
COMMENT ON COLUMN players.height_cm IS 'Altezza in centimetri';
COMMENT ON COLUMN players.weight_kg IS 'Peso in kilogrammi';
COMMENT ON COLUMN players.market_value_numeric IS 'Valore di mercato in milioni';
COMMENT ON COLUMN players.market_value_updated IS 'Data aggiornamento valore';
COMMENT ON COLUMN players.profile_image IS 'URL immagine profilo';
COMMENT ON COLUMN players.natural_position IS 'Ruolo naturale';
COMMENT ON COLUMN players.other_positions IS 'Altri ruoli possibili';

-- CREA INDICI
CREATE INDEX IF NOT EXISTS idx_players_height_cm ON players(height_cm);
CREATE INDEX IF NOT EXISTS idx_players_market_value_numeric ON players(market_value_numeric DESC);
CREATE INDEX IF NOT EXISTS idx_players_natural_position ON players(natural_position);
```

### 4. **Esegui lo Script**
1. Incolla lo script nell'editor
2. Clicca su **"Run"** (o premi `Ctrl/Cmd + Enter`)
3. Attendi il messaggio di successo

### 5. **Verifica le Modifiche**
Esegui questa query per verificare:

```sql
SELECT 
    column_name, 
    data_type
FROM 
    information_schema.columns
WHERE 
    table_name = 'players'
    AND column_name IN (
        'height_cm', 
        'weight_kg', 
        'market_value_numeric',
        'market_value_updated',
        'profile_image',
        'natural_position',
        'other_positions'
    );
```

**Output atteso:**
```
column_name            | data_type
-----------------------|------------
height_cm              | integer
weight_kg              | integer
market_value_numeric   | numeric
market_value_updated   | varchar
profile_image          | text
natural_position       | varchar
other_positions        | text
```

---

## 📊 Nuove Colonne Aggiunte

| Colonna | Tipo | Descrizione | Esempio |
|---------|------|-------------|---------|
| `height_cm` | INTEGER | Altezza in cm | 192 |
| `weight_kg` | INTEGER | Peso in kg | 85 |
| `market_value_numeric` | DECIMAL(10,2) | Valore in milioni € | 3.50 |
| `market_value_updated` | VARCHAR(20) | Data aggiornamento | "23/09/2025" |
| `profile_image` | TEXT | URL immagine | "https://..." |
| `natural_position` | VARCHAR(100) | Ruolo naturale | "Difensore centrale" |
| `other_positions` | TEXT | Altri ruoli | "Terzino sinistro" |

---

## 🔄 Migrazione Dati Esistenti (Opzionale)

Se hai già giocatori nel database con dati nei vecchi campi, puoi convertirli:

### Converti Altezza da Stringa a Intero
```sql
UPDATE players 
SET height_cm = (
    CASE 
        WHEN height ~ '^\d+,\d+' THEN 
            CAST(REPLACE(SUBSTRING(height FROM '^\d+,\d+'), ',', '.') AS DECIMAL) * 100
        ELSE NULL
    END
)
WHERE height IS NOT NULL AND height_cm IS NULL;
```

### Converti Valore di Mercato
```sql
UPDATE players 
SET market_value_numeric = (
    CASE 
        WHEN market_value ~ '\d+[,.]?\d*\s*mln' THEN 
            CAST(REPLACE(REGEXP_REPLACE(market_value, '[^\d,.]', '', 'g'), ',', '.') AS DECIMAL)
        ELSE NULL
    END
)
WHERE market_value IS NOT NULL AND market_value_numeric IS NULL;
```

---

## ✅ Checklist Post-Migrazione

- [ ] Script eseguito senza errori
- [ ] Tutte le 7 colonne create
- [ ] Indici creati correttamente
- [ ] Dati esistenti preservati
- [ ] Query di verifica eseguita con successo

---

## 🎯 Prossimi Passi

1. **Testa l'importazione** da Transfermarkt
2. **Verifica** che i dati vengano salvati correttamente
3. **Aggiorna il frontend** per visualizzare i nuovi campi

---

## 🆘 Troubleshooting

### Errore: "column already exists"
✅ **Soluzione:** Lo script usa `IF NOT EXISTS`, quindi è sicuro rieseguirlo.

### Errore: "permission denied"
❌ **Problema:** Non hai i permessi necessari
✅ **Soluzione:** Assicurati di essere owner del progetto Supabase

### Errore: "relation players does not exist"
❌ **Problema:** La tabella players non esiste
✅ **Soluzione:** Esegui prima lo script di creazione tabella originale

---

## 📸 Screenshot Processo

### 1. SQL Editor
```
Supabase Dashboard
├── SQL Editor (sidebar)
│   ├── + New query
│   └── [Incolla script]
└── Run ▶️
```

### 2. Verifica Successo
```
✅ Success. No rows returned
```

### 3. Verifica Colonne
```
7 rows returned
✅ Tutte le colonne create
```

---

## 🔐 Sicurezza

Le nuove colonne ereditano automaticamente le policy RLS esistenti.
Non è necessario modificare le policy di sicurezza.

---

## 📚 Riferimenti

- **Script migrazione:** `database/migration/add_transfermarkt_fields.sql`
- **Documentazione dati:** `DATI_ESTRATTI_FINALI.md`
- **Schema originale:** `database/schema.sql`

---

**Tempo stimato:** 2-3 minuti  
**Difficoltà:** ⭐ Facile  
**Rischio perdita dati:** ❌ Nessuno (usa ALTER TABLE)

---

✅ **Pronto per la migrazione!**
