# 🔄 Migrazione Database - Player Reports

## ⚠️ Problema
Il database non ha i nuovi campi necessari per il sistema di report aggiornato.

## ✅ Soluzione
Eseguire la migrazione SQL per aggiungere i campi mancanti.

---

## 📋 Istruzioni per Eseguire la Migrazione

### Opzione 1: Tramite Dashboard Supabase (CONSIGLIATO)

1. Vai su: https://djfwugugjbgflgfdbufd.supabase.co
2. Accedi al tuo progetto
3. Nel menu laterale, clicca su **"SQL Editor"**
4. Clicca su **"New query"**
5. Copia e incolla il contenuto del file `update_player_reports_fields.sql`
6. Clicca su **"Run"** (o premi Ctrl+Enter)
7. Verifica che appaia il messaggio di successo

### Opzione 2: Tramite CLI Supabase

```bash
# Dalla cartella del progetto
cd /Users/alessioecca/windsurf/scouting_database

# Esegui la migrazione
supabase db push database/migration/update_player_reports_fields.sql
```

---

## 📝 Cosa fa la Migrazione

### ✅ Aggiunge Campi

- **`match_name`** VARCHAR(255)
  - Nome della partita (es: "Juve-Milan")
  - Visibile solo se check_type ≠ 'Dati'

- **`athletic_data_rating`** VARCHAR(10)
  - Valutazione dati atletici: 🔴🟠🟡🟢🏆
  - Visibile solo se check_type = 'Dati'

### ❌ Rimuove Campi Obsoleti

- `competition` (sostituito da match_name)
- `opponent_team` (sostituito da match_name)
- `matches_watched` (non più necessario)

### 🔄 Aggiorna Default

- `check_type` DEFAULT 'Live' (prima era 'Partita')

---

## 🧪 Verifica Migrazione

Dopo aver eseguito la migrazione, verifica che i campi siano stati aggiunti:

```sql
-- Esegui questa query nel SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'player_reports'
ORDER BY ordinal_position;
```

Dovresti vedere:
- ✅ match_name
- ✅ athletic_data_rating

E NON dovresti più vedere:
- ❌ competition
- ❌ opponent_team
- ❌ matches_watched

---

## 🎯 Dopo la Migrazione

Una volta completata la migrazione:

1. Ricarica l'applicazione React
2. Prova ad aggiungere un nuovo giocatore con i dati del report
3. Verifica che il report venga creato senza errori
4. Controlla che il report sia visibile nella sezione "Gestisci Report"

---

## 🆘 In Caso di Errori

Se la migrazione fallisce:

1. Verifica di essere connesso al database corretto
2. Controlla di avere i permessi necessari
3. Verifica che la tabella `player_reports` esista
4. Contatta il supporto Supabase se necessario

---

## 📞 Supporto

Per problemi con la migrazione, controlla:
- Log del SQL Editor in Supabase
- Console del browser per errori JavaScript
- File di log dell'applicazione
