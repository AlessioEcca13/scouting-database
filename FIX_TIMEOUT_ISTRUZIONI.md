# 🔧 FIX TIMEOUT LOGIN - Istruzioni

## 🐛 Problema
Quando ricarichi la pagina con password salvata, l'app entra in loop di caricamento con errore:
```
⚠️ Query timeout dopo 8 secondi - possibile problema RLS o network
```

## 🎯 Causa
Le **RLS policies** su Supabase per la tabella `users_profiles` sono ricorsive o troppo complesse, causando timeout nelle query.

## ✅ Soluzione

### STEP 1: Vai su Supabase Dashboard
1. Apri [https://supabase.com](https://supabase.com)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (icona `</>` nella sidebar)

### STEP 2: Esegui lo script SQL
1. Clicca su **+ New Query**
2. Copia TUTTO il contenuto del file: `database/migration/FIX_RLS_FINAL.sql`
3. Incolla nell'editor SQL
4. Clicca su **Run** (o premi `Ctrl+Enter`)

### STEP 3: Verifica il risultato
Dovresti vedere nella sezione "Results":
- 4 policies create:
  - `authenticated_select_all`
  - `authenticated_insert_own`
  - `authenticated_update_own`
  - `authenticated_delete_own`

### STEP 4: Test
1. **Ricarica l'app** nel browser (`Ctrl+Shift+R` per hard refresh)
2. **Fai logout** se sei loggato
3. **Fai login** di nuovo
4. **Verifica**: Nessun timeout, login immediato

## 🔍 Verifica Policies (Opzionale)

Se vuoi verificare le policies direttamente su Supabase:

1. Vai su **Database** → **Tables**
2. Seleziona la tabella `users_profiles`
3. Clicca sul tab **Policies**
4. Dovresti vedere 4 policies con questi nomi

## ⚠️ Note Importanti

- **NON modificare** le policies manualmente dall'interfaccia
- **Esegui lo script completo** una sola volta
- Se hai ancora problemi, esegui di nuovo lo script (rimuove e ricrea tutto)
- Le vecchie policies vengono automaticamente rimosse dallo script

## 🆘 Se Ancora Non Funziona

1. **Controlla la console** del browser per altri errori
2. **Verifica la connessione** a Supabase
3. **Controlla che RLS sia abilitato** sulla tabella `users_profiles`
4. **Esegui di nuovo** lo script SQL

## 📝 Cosa Fa lo Script

1. **Disabilita RLS** temporaneamente
2. **Rimuove TUTTE** le policies esistenti (anche quelle problematiche)
3. **Riabilita RLS**
4. **Crea 4 policies semplici** senza ricorsione:
   - SELECT: Tutti vedono tutti (necessario per l'app)
   - INSERT: Solo il proprio profilo
   - UPDATE: Solo il proprio profilo
   - DELETE: Solo il proprio profilo

## ✅ Risultato Atteso

- ✅ Login immediato (< 1 secondo)
- ✅ Nessun timeout
- ✅ Nessun loop di caricamento
- ✅ App funzionante anche con password salvata
