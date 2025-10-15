# 📋 Istruzioni: Attivare Funzionalità Liste & Formazioni

## ⚠️ IMPORTANTE: Migrazione Database Richiesta

Prima di utilizzare la funzionalità "Liste & Formazioni", devi creare la tabella `player_lists` nel database Supabase.

---

## 🔧 Passo 1: Accedi a Supabase

1. Vai su [https://supabase.com](https://supabase.com)
2. Accedi al tuo progetto
3. Nel menu laterale, clicca su **"SQL Editor"**

---

## 📝 Passo 2: Esegui la Migrazione SQL

### Opzione A: Copia e Incolla

1. Apri il file: `/database/migration/create_player_lists.sql`
2. Copia **tutto il contenuto** del file
3. Incollalo nell'editor SQL di Supabase
4. Clicca su **"Run"** (o premi `Ctrl+Enter`)

### Opzione B: SQL Diretto

Copia e incolla questo codice nell'SQL Editor:

```sql
-- Migration: Create player_lists table
-- Description: Tabella per gestire liste di giocatori e formazioni

CREATE TABLE IF NOT EXISTS player_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  player_ids UUID[] DEFAULT '{}',
  formation TEXT DEFAULT '4-3-3',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index per ricerca veloce
CREATE INDEX IF NOT EXISTS idx_player_lists_created_at ON player_lists(created_at DESC);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_player_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_lists_updated_at
  BEFORE UPDATE ON player_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_player_lists_updated_at();

-- Commenti
COMMENT ON TABLE player_lists IS 'Liste di giocatori per formazioni tattiche';
COMMENT ON COLUMN player_lists.name IS 'Nome della lista';
COMMENT ON COLUMN player_lists.description IS 'Descrizione opzionale della lista';
COMMENT ON COLUMN player_lists.player_ids IS 'Array di ID giocatori nella lista';
COMMENT ON COLUMN player_lists.formation IS 'Formazione tattica (es. 4-3-3, 4-4-2)';
```

---

## ✅ Passo 3: Verifica Creazione Tabella

1. Nel menu laterale di Supabase, clicca su **"Table Editor"**
2. Dovresti vedere la nuova tabella **`player_lists`**
3. Clicca sulla tabella per verificare le colonne:
   - `id` (UUID)
   - `name` (TEXT)
   - `description` (TEXT)
   - `player_ids` (UUID[])
   - `formation` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

---

## 🚀 Passo 4: Utilizza la Funzionalità

Ora puoi:

1. **Riavvia l'app** (se necessario)
2. Vai alla sezione **"Liste & Formazioni"** nel menu
3. Clicca su **"Nuova Lista"**
4. Inserisci un nome (es. "Squadra Titolare")
5. Clicca su **"Crea Lista"**

✅ **Dovrebbe funzionare!**

---

## 🐛 Risoluzione Problemi

### Errore: "Tabella player_lists non trovata"

**Causa:** La migrazione SQL non è stata eseguita

**Soluzione:**
1. Segui i passi 1-3 sopra
2. Assicurati di cliccare "Run" nell'SQL Editor
3. Verifica che non ci siano errori nella console SQL

### Errore: "Permission denied"

**Causa:** Politiche RLS (Row Level Security) attive

**Soluzione:** Disabilita temporaneamente RLS per la tabella:

```sql
ALTER TABLE player_lists DISABLE ROW LEVEL SECURITY;
```

Oppure crea una policy permissiva:

```sql
CREATE POLICY "Enable all access for player_lists" 
ON player_lists 
FOR ALL 
USING (true) 
WITH CHECK (true);
```

### Errore generico

1. Controlla la **console del browser** (F12 → Console)
2. Controlla i **logs di Supabase**
3. Verifica che il file `.env` contenga le credenziali corrette

---

## 📊 Struttura Tabella

```
player_lists
├── id (UUID, PRIMARY KEY)
├── name (TEXT, NOT NULL)          → Nome della lista
├── description (TEXT)              → Descrizione opzionale
├── player_ids (UUID[])             → Array di ID giocatori
├── formation (TEXT)                → Formazione (4-3-3, 4-4-2, etc.)
├── created_at (TIMESTAMP)          → Data creazione
└── updated_at (TIMESTAMP)          → Data ultimo aggiornamento
```

---

## 🎯 Funzionalità Disponibili

Dopo la migrazione, potrai:

✅ **Creare liste** personalizzate di giocatori
✅ **Aggiungere/rimuovere** giocatori dalle liste
✅ **Visualizzare formazioni** tattiche sul campo
✅ **Cambiare modulo** (4-3-3, 4-4-2, 3-5-2, etc.)
✅ **Personalizzare** colore campo e zoom
✅ **Mostrare/nascondere** info giocatori (foto, età, squadra, etc.)

---

## 📞 Supporto

Se continui ad avere problemi:

1. Controlla che Supabase sia online
2. Verifica le credenziali in `.env`
3. Controlla i permessi del progetto Supabase
4. Guarda la console del browser per errori dettagliati

---

**Buon scouting! ⚽🎉**
