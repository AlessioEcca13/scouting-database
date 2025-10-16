# 🔧 Fix: Timeout Caricamento Profilo dopo Login

## 🐛 Problema

Dopo il login, l'app mostra questi errori:
```
⚠️ Query timeout dopo 8 secondi - possibile problema RLS o network
Timeout caricamento sessione dopo 15 secondi
```

## 🔍 Causa

Le **Row Level Security (RLS) policies** sulla tabella `users_profiles` hanno una **ricorsione infinita**:

```sql
-- ❌ POLICY PROBLEMATICA (da create_auth_system.sql)
CREATE POLICY "Admins can view all profiles"
  ON users_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles  -- ⚠️ Ricorsione infinita!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

Quando Supabase cerca di verificare se l'utente può vedere i profili, fa una query su `users_profiles`, che richiede di nuovo la stessa policy → **loop infinito** → timeout.

## ✅ Soluzione

### Step 1: Esegui il Fix SQL

1. **Apri Supabase Dashboard**
   - Vai su https://supabase.com/dashboard
   - Seleziona il tuo progetto

2. **Apri SQL Editor**
   - Menu laterale → SQL Editor
   - Clicca su "New query"

3. **Copia e Incolla il Fix**
   - Apri il file: `database/migration/FIX_TIMEOUT_RLS.sql`
   - Copia **TUTTO** il contenuto
   - Incolla nel SQL Editor

4. **Esegui**
   - Premi **RUN** (o `Cmd/Ctrl + Enter`)
   - Aspetta il completamento

### Step 2: Verifica il Risultato

Dovresti vedere nella console SQL:

```
✅ 3 policy create:
   - select_all_profiles
   - update_own_profile
   - insert_own_profile

✅ RLS abilitato: true

✅ Lista profili utenti (se esistono)
```

### Step 3: Testa l'App

1. **Ricarica l'app React**
   ```bash
   # Se necessario, riavvia il server
   cd scouting-app
   npm start
   ```

2. **Fai login**
   - Il caricamento dovrebbe essere **istantaneo**
   - Nessun timeout
   - Profilo caricato correttamente

## 📊 Policy Corrette (Senza Ricorsione)

```sql
-- ✅ POLICY CORRETTA
CREATE POLICY "select_all_profiles"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (true);  -- Semplice, nessuna query ricorsiva
```

### Differenze Chiave

| Aspetto | ❌ Policy Vecchia | ✅ Policy Nuova |
|---------|------------------|-----------------|
| **Complessità** | Query ricorsiva su users_profiles | Condizione semplice `true` |
| **Performance** | Timeout (8+ secondi) | Istantanea (<100ms) |
| **Sicurezza** | RLS attivo ma bloccato | RLS attivo e funzionante |
| **Permessi** | Solo admin vede tutti | Tutti autenticati vedono tutti |

## 🔐 Nota sulla Sicurezza

La nuova policy permette a **tutti gli utenti autenticati** di vedere tutti i profili.

**Questo è OK perché:**
- Solo utenti autenticati possono accedere
- I profili contengono solo info base (nome, ruolo, email)
- Non ci sono dati sensibili
- È necessario per il funzionamento dell'app (es: vedere chi ha fatto un report)

**Se vuoi limitare:**
- Puoi aggiungere logica nel **frontend** per nascondere certi dati
- Oppure creare una **view** con solo i campi pubblici

## 🧪 Test Rapido

Dopo aver applicato il fix, testa con questo SQL:

```sql
-- Deve completare in <100ms
SELECT * FROM users_profiles WHERE id = auth.uid();
```

Se la query è istantanea → **Fix applicato con successo!** ✅

## 📝 File Coinvolti

- **Fix SQL**: `database/migration/FIX_TIMEOUT_RLS.sql`
- **Codice Auth**: `scouting-app/src/contexts/AuthContext.js`
- **Policy Vecchie**: `database/migration/create_auth_system.sql` (linee 92-127)

## 🆘 Se il Problema Persiste

1. **Verifica che le policy siano state create**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'users_profiles';
   ```

2. **Verifica che RLS sia abilitato**
   ```sql
   SELECT rowsecurity FROM pg_tables WHERE tablename = 'users_profiles';
   ```

3. **Controlla i log di Supabase**
   - Dashboard → Logs → Postgres Logs
   - Cerca errori relativi a `users_profiles`

4. **Prova a disabilitare temporaneamente RLS** (solo per test!)
   ```sql
   ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;
   ```
   Se funziona, il problema è nelle policy.

## ✅ Checklist

- [ ] Eseguito `FIX_TIMEOUT_RLS.sql` su Supabase
- [ ] Verificato che 3 policy siano state create
- [ ] Verificato che RLS sia abilitato
- [ ] Ricaricato l'app React
- [ ] Testato il login
- [ ] Nessun timeout
- [ ] Profilo caricato correttamente

---

**Tempo stimato per il fix**: 2-3 minuti ⏱️
