# 🚨 ERRORE: Colonne Mancanti nel Database

## ❌ Problema

Stai cercando di aggiungere un giocatore ma il database non ha le nuove colonne:

```
Could not find the 'birth_place' column of 'players' in the schema cache
```

---

## ✅ SOLUZIONE - 3 PASSI

### **PASSO 1: Apri Supabase SQL Editor**

1. Vai su [supabase.com](https://supabase.com)
2. Seleziona il tuo progetto
3. Clicca **"SQL Editor"** nella sidebar sinistra
4. Clicca **"New query"**

---

### **PASSO 2: Copia e Incolla Questo Script**

```sql
-- MIGRAZIONE COMPLETA - Aggiungi tutte le colonne
ALTER TABLE players ADD COLUMN IF NOT EXISTS contract_expiry VARCHAR(50);
ALTER TABLE players ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS weight_kg INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS market_value_numeric DECIMAL(10,2);
ALTER TABLE players ADD COLUMN IF NOT EXISTS market_value_updated VARCHAR(20);
ALTER TABLE players ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS natural_position VARCHAR(100);
ALTER TABLE players ADD COLUMN IF NOT EXISTS other_positions TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100);
ALTER TABLE players ADD COLUMN IF NOT EXISTS shirt_number INTEGER;
ALTER TABLE players ADD COLUMN IF NOT EXISTS field_position_x DECIMAL(5,2);
ALTER TABLE players ADD COLUMN IF NOT EXISTS field_position_y DECIMAL(5,2);

-- Verifica
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'players'
AND column_name IN (
    'contract_expiry', 'height_cm', 'weight_kg', 'market_value_numeric',
    'market_value_updated', 'profile_image', 'natural_position', 'other_positions',
    'birth_place', 'shirt_number', 'field_position_x', 'field_position_y'
)
ORDER BY column_name;
```

---

### **PASSO 3: Esegui lo Script**

1. Clicca il pulsante **"Run"** (o premi `Ctrl+Enter` / `Cmd+Enter`)
2. Dovresti vedere **12 righe** nel risultato della query di verifica
3. ✅ **Fatto!**

---

## 📋 Colonne Aggiunte

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `contract_expiry` | VARCHAR(50) | Scadenza contratto |
| `height_cm` | INTEGER | Altezza in cm |
| `weight_kg` | INTEGER | Peso in kg |
| `market_value_numeric` | DECIMAL(10,2) | Valore mercato (€M) |
| `market_value_updated` | VARCHAR(20) | Data aggiornamento |
| `profile_image` | TEXT | URL immagine profilo |
| `natural_position` | VARCHAR(100) | Ruolo naturale |
| `other_positions` | TEXT | Altri ruoli |
| `birth_place` | VARCHAR(100) | Luogo di nascita |
| `shirt_number` | INTEGER | Numero maglia |
| `field_position_x` | DECIMAL(5,2) | Coordinata X campo |
| `field_position_y` | DECIMAL(5,2) | Coordinata Y campo |

---

## 🎯 Dopo la Migrazione

1. **Ricarica la pagina** dell'app React
2. **Prova ad aggiungere** un giocatore
3. **Dovrebbe funzionare!** ✅

---

## 📁 File SQL Completo

Puoi anche usare il file:
**`database/migration/MIGRAZIONE_COMPLETA.sql`**

Contiene lo stesso script con commenti aggiuntivi.

---

## 🔍 Verifica Manuale

Per verificare che le colonne esistano:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'players' 
ORDER BY column_name;
```

Dovresti vedere tutte le 12 nuove colonne nella lista.

---

## ❓ Problemi Comuni

### **"Permission denied"**
- Assicurati di essere loggato come owner del progetto
- Controlla i permessi del database

### **"Column already exists"**
- Non è un problema! `IF NOT EXISTS` previene errori
- La colonna esiste già, puoi procedere

### **"Syntax error"**
- Copia lo script esattamente come scritto
- Non modificare le virgolette o i punti e virgola

---

## 🚀 Prossimi Passi

Dopo aver eseguito la migrazione:

1. ✅ Aggiungi giocatori manualmente
2. ✅ Importa da Transfermarkt
3. ✅ Vedi le schede complete con tutti i dati
4. ✅ Posizionamento esatto nel campo

---

**IMPORTANTE:** Devi eseguire questo script **UNA SOLA VOLTA** su Supabase.

Dopo averlo fatto, l'app funzionerà perfettamente! 🎉
