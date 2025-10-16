# 🚨 FIX URGENTE: Timeout Login (Passo-Passo)

## ⚡ Fix Rapido (5 minuti)

### Step 1: Apri Supabase Dashboard

1. Vai su **https://supabase.com/dashboard**
2. Seleziona il tuo progetto
3. Nel menu laterale, clicca su **SQL Editor**

### Step 2: Verifica lo Stato Attuale

1. Nel SQL Editor, clicca su **"New query"**
2. Apri il file: `database/migration/VERIFICA_RLS_STATUS.sql`
3. **Copia TUTTO** il contenuto
4. **Incolla** nel SQL Editor
5. Premi **RUN** (o `Cmd/Ctrl + Enter`)

**Cosa cercare nei risultati:**
- ✅ Se vedi `select_all_profiles` → Fix già applicato (vai allo Step 4)
- ❌ Se vedi `Admins can view all profiles` → Fix NON applicato (continua con Step 3)
- ⏱️ Se la query va in timeout → Problema RLS confermato (continua con Step 3)

### Step 3: Applica il Fix FORZATO

1. Nel SQL Editor, crea una **nuova query** (clicca "New query")
2. Apri il file: `database/migration/FIX_TIMEOUT_RLS_FORCE.sql`
3. **Copia TUTTO** il contenuto (tutte le 100+ righe)
4. **Incolla** nel SQL Editor
5. Premi **RUN** (o `Cmd/Ctrl + Enter`)
6. **Aspetta** che completi (dovrebbe essere veloce, 1-2 secondi)

**Risultato atteso:**
```
✅ Tutte le policy rimosse con successo
✅ Creata policy: select_all_profiles
✅ Creata policy: update_own_profile
✅ Creata policy: insert_own_profile
✅ RLS riabilitato

=== TEST QUERY ===
total_profiles: 1 (o più)
```

### Step 4: Testa l'App

1. **Torna all'app React** (http://localhost:3000)
2. **Ricarica la pagina** (F5 o Cmd/Ctrl + R)
3. **Fai logout** (se sei loggato)
4. **Fai login** di nuovo

**Risultato atteso:**
- ✅ Login **istantaneo** (1-2 secondi max)
- ✅ Nessun messaggio di timeout
- ✅ Profilo caricato correttamente
- ✅ App funzionante

---

## 🔍 Se il Problema Persiste

### Opzione A: Verifica le Credenziali Supabase

Controlla che l'app stia usando il progetto Supabase corretto:

1. Apri: `scouting-app/.env`
2. Verifica:
   ```env
   REACT_APP_SUPABASE_URL=https://tuo-progetto.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=tua-chiave-anonima
   ```
3. Confronta con Supabase Dashboard → Settings → API

### Opzione B: Controlla i Log di Supabase

1. Supabase Dashboard → **Logs** → **Postgres Logs**
2. Cerca errori recenti relativi a `users_profiles`
3. Cerca messaggi tipo:
   - "infinite recursion detected"
   - "query timeout"
   - "RLS policy error"

### Opzione C: Disabilita Temporaneamente RLS (Solo per Test!)

**⚠️ ATTENZIONE: Questo rimuove la sicurezza! Solo per debugging!**

```sql
-- Esegui su Supabase SQL Editor
ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;
```

Poi testa il login:
- ✅ Se funziona → Il problema è nelle policy RLS
- ❌ Se non funziona → Il problema è altrove (network, credenziali, ecc.)

**Riabilita subito RLS dopo il test:**
```sql
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
```

### Opzione D: Controlla la Tabella users_profiles

Verifica che la tabella esista e abbia dati:

```sql
-- Esegui su Supabase SQL Editor
SELECT * FROM users_profiles LIMIT 5;
```

Se vedi errore "table does not exist":
1. La tabella non è stata creata
2. Esegui: `database/migration/create_auth_system.sql`
3. Poi applica il fix RLS

---

## 📊 Checklist Completa

- [ ] Aperto Supabase Dashboard
- [ ] Eseguito `VERIFICA_RLS_STATUS.sql`
- [ ] Verificato che ci siano policy problematiche
- [ ] Eseguito `FIX_TIMEOUT_RLS_FORCE.sql`
- [ ] Visto messaggi "✅ Creata policy..."
- [ ] Test query completata istantaneamente
- [ ] Ricaricato app React
- [ ] Fatto logout e login
- [ ] Login funziona senza timeout
- [ ] Profilo caricato correttamente

---

## 🆘 Aiuto Rapido

### Errore: "table users_profiles does not exist"

**Soluzione:**
```sql
-- Crea la tabella prima
-- Esegui: database/migration/create_auth_system.sql
-- Poi esegui il fix RLS
```

### Errore: "permission denied for table users_profiles"

**Soluzione:**
- Stai usando l'utente sbagliato
- Usa il **service_role key** (non anon key) nel SQL Editor
- Oppure usa il Dashboard di Supabase (già autenticato)

### Errore: "policy already exists"

**Soluzione:**
```sql
-- Rimuovi tutte le policy manualmente
DROP POLICY IF EXISTS "select_all_profiles" ON users_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON users_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;

-- Poi esegui di nuovo il fix
```

---

## 📞 Contatti

Se il problema persiste dopo aver seguito tutti gli step:

1. **Controlla i file di log:**
   - Browser Console (F12)
   - Supabase Logs
   - Terminal dove gira `npm start`

2. **Raccogli informazioni:**
   - Screenshot dell'errore
   - Output di `VERIFICA_RLS_STATUS.sql`
   - Versione di Supabase

3. **Cerca aiuto:**
   - Supabase Discord
   - Stack Overflow
   - GitHub Issues

---

**Tempo stimato totale:** 5 minuti ⏱️

**Difficoltà:** ⭐⭐☆☆☆ (Facile - basta copiare e incollare)
