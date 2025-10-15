# 🔐 Guida: Sistema di Autenticazione Multi-Ruolo

## 📋 Panoramica

Sistema completo di autenticazione con:
- **Login** con email e password
- **3 Ruoli**: Admin, Scout, Viewer
- **Permessi differenziati** per ogni ruolo
- **Collegamento utente-scout** per i report

---

## 🎯 Ruoli e Permessi

### **👑 Admin (Amministratore)**
- ✅ Aggiungere giocatori
- ✅ Modificare giocatori
- ✅ Eliminare giocatori
- ✅ Compilare report
- ✅ Vedere tutti i report (anche di altri scout)
- ✅ Gestire liste e formazioni

### **⚽ Scout**
- ✅ Aggiungere giocatori
- ✅ Modificare giocatori
- ❌ Eliminare giocatori
- ✅ Compilare report (solo i propri)
- ❌ Vedere report di altri scout
- ✅ Gestire liste e formazioni

### **👁️ Viewer (Visualizzatore)**
- ❌ Aggiungere giocatori
- ❌ Modificare giocatori
- ❌ Eliminare giocatori
- ❌ Compilare report
- ✅ Vedere tutti i report
- ❌ Gestire liste

---

## 🔧 Installazione

### **Passo 1: Esegui Migrazione SQL**

In Supabase SQL Editor, esegui:

```sql
-- File: /database/migration/create_auth_system.sql
-- Copia tutto il contenuto del file e eseguilo
```

Questo creerà:
- Tabella `users_profiles`
- Trigger per auto-creazione profili
- Policies RLS
- Funzioni helper

---

### **Passo 2: Crea Utenti in Supabase**

1. Vai su **Supabase Dashboard** → **Authentication** → **Users**
2. Clicca **"Add user"** → **"Create new user"**

#### **Utente Admin:**
```
Email: admin@lamecca.com
Password: [scegli una password sicura]
Auto Confirm User: ✅ (attiva)
```

#### **Utente Roberto (Scout):**
```
Email: roberto@lamecca.com
Password: [scegli una password sicura]
Auto Confirm User: ✅ (attiva)
```

#### **Utente Alessio (Scout):**
```
Email: alessio@lamecca.com
Password: [scegli una password sicura]
Auto Confirm User: ✅ (attiva)
```

---

### **Passo 3: Configura Profili Utenti**

Dopo aver creato gli utenti, vai su **Table Editor** → **users_profiles** e aggiorna i record:

#### **Admin:**
```sql
UPDATE users_profiles
SET 
  full_name = 'Admin',
  role = 'admin',
  scout_name = NULL,
  can_add_players = true,
  can_edit_players = true,
  can_delete_players = true,
  can_add_reports = true,
  can_view_all_reports = true,
  can_manage_lists = true,
  is_active = true
WHERE email = 'admin@lamecca.com';
```

#### **Roberto (Scout):**
```sql
UPDATE users_profiles
SET 
  full_name = 'Roberto',
  role = 'scout',
  scout_name = 'Roberto',
  can_add_players = true,
  can_edit_players = true,
  can_delete_players = false,
  can_add_reports = true,
  can_view_all_reports = false,
  can_manage_lists = true,
  is_active = true
WHERE email = 'roberto@lamecca.com';
```

#### **Alessio (Scout):**
```sql
UPDATE users_profiles
SET 
  full_name = 'Alessio',
  role = 'scout',
  scout_name = 'Alessio',
  can_add_players = true,
  can_edit_players = true,
  can_delete_players = false,
  can_add_reports = true,
  can_view_all_reports = false,
  can_manage_lists = true,
  is_active = true
WHERE email = 'alessio@lamecca.com';
```

---

## 🚀 Utilizzo

### **Login**

1. Apri l'app
2. Vedrai la schermata di login
3. Inserisci email e password
4. Clicca "Accedi"

### **Interfaccia Utente**

Dopo il login:
- **Header**: Nome utente, ruolo, badge permessi
- **Menu dropdown**: Click sull'avatar per vedere profilo e logout
- **Navigazione**: Solo le sezioni permesse sono accessibili

### **Permessi in Azione**

#### **Viewer:**
- ❌ Non vede il bottone "Aggiungi Giocatore"
- ❌ Non vede il bottone "Elimina" sulle card giocatori
- ❌ Non vede "Compila Report"
- ✅ Può vedere tutti i report

#### **Scout:**
- ✅ Vede "Aggiungi Giocatore"
- ❌ Non vede "Elimina"
- ✅ Vede "Compila Report"
- ❌ Vede solo i propri report

#### **Admin:**
- ✅ Accesso completo a tutto

---

## 🔗 Collegamento Utente-Scout

### **Come Funziona:**

1. Quando uno scout compila un report, il campo `scout_name` viene automaticamente popolato con il nome dello scout dal profilo utente
2. Il campo `scout_name` in `users_profiles` deve corrispondere al nome usato nei report

### **Esempio:**

```javascript
// In PlayerReports.js
<PlayerReports 
  player={player}
  scoutName={profile.scout_name || profile.full_name}
  onClose={...}
/>
```

Questo garantisce che:
- Roberto vede solo i report con `scout_name = 'Roberto'`
- Alessio vede solo i report con `scout_name = 'Alessio'`
- Admin vede tutti i report

---

## 📊 Struttura Database

### **Tabella: users_profiles**

```sql
CREATE TABLE users_profiles (
  id UUID PRIMARY KEY,                    -- FK a auth.users
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'scout', 'viewer')),
  scout_name TEXT,                        -- Nome scout per report
  can_add_players BOOLEAN DEFAULT false,
  can_edit_players BOOLEAN DEFAULT false,
  can_delete_players BOOLEAN DEFAULT false,
  can_add_reports BOOLEAN DEFAULT false,
  can_view_all_reports BOOLEAN DEFAULT false,
  can_manage_lists BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 Componenti Creati

### **1. Login.js**
- Schermata di login
- Validazione credenziali
- Gestione errori
- UI moderna con gradiente

### **2. AuthContext.js**
- Context React per autenticazione
- Hook `useAuth()` per accedere allo stato
- Funzioni: `signIn()`, `signOut()`, `hasPermission()`
- Permessi: `canAddPlayers`, `canDeletePlayers`, etc.

### **3. App.js (Aggiornato)**
- Wrapper con `AuthProvider`
- Protezione route basata su permessi
- Mostra login se non autenticato
- Passa `scoutName` ai componenti

### **4. Navigation.js (Aggiornato)**
- Menu dropdown utente
- Badge ruolo
- Lista permessi
- Bottone logout

---

## 🔐 Sicurezza

### **Row Level Security (RLS)**

Le policies RLS garantiscono che:
- Gli utenti vedano solo il proprio profilo
- Gli admin vedano tutti i profili
- Nessuno possa modificare il proprio ruolo

### **Funzioni Helper**

```sql
-- Verifica permesso
SELECT check_user_permission('can_add_players');
```

---

## 🐛 Risoluzione Problemi

### **Errore: "Email not confirmed"**

**Soluzione:**
1. Vai su Supabase → Authentication → Users
2. Trova l'utente
3. Clicca sui 3 puntini → "Confirm email"

### **Errore: "Account disattivato"**

**Soluzione:**
```sql
UPDATE users_profiles
SET is_active = true
WHERE email = 'utente@email.com';
```

### **Errore: "Profilo non trovato"**

**Soluzione:**
```sql
-- Crea profilo manualmente
INSERT INTO users_profiles (id, email, full_name, role)
VALUES (
  'uuid-from-auth-users',
  'email@example.com',
  'Nome Completo',
  'scout'
);
```

### **Non vedo alcune sezioni**

**Causa:** Permessi non configurati

**Soluzione:**
```sql
UPDATE users_profiles
SET 
  can_add_players = true,
  can_add_reports = true,
  can_manage_lists = true
WHERE email = 'tuo@email.com';
```

---

## 📝 Aggiungere Nuovi Utenti

### **Metodo 1: Tramite Supabase Dashboard**

1. Authentication → Users → Add user
2. Inserisci email e password
3. Attiva "Auto Confirm User"
4. Clicca "Create user"
5. Vai su Table Editor → users_profiles
6. Aggiorna il profilo con ruolo e permessi

### **Metodo 2: Tramite SQL**

```sql
-- Nota: L'utente deve esistere in auth.users prima
INSERT INTO users_profiles (
  id, 
  email, 
  full_name, 
  role, 
  scout_name,
  can_add_players,
  can_edit_players,
  can_delete_players,
  can_add_reports,
  can_view_all_reports,
  can_manage_lists
) VALUES (
  'uuid-from-auth-users',
  'nuovo@scout.com',
  'Nuovo Scout',
  'scout',
  'Nuovo',
  true,  -- can_add_players
  true,  -- can_edit_players
  false, -- can_delete_players
  true,  -- can_add_reports
  false, -- can_view_all_reports
  true   -- can_manage_lists
);
```

---

## 🎯 Best Practices

1. **Password Sicure**: Usa password complesse (min 8 caratteri, maiuscole, numeri, simboli)
2. **Scout Name**: Deve corrispondere esattamente al nome nei report esistenti
3. **Backup**: Esporta la tabella `users_profiles` prima di modifiche importanti
4. **Test**: Testa ogni ruolo dopo la configurazione
5. **Documentazione**: Mantieni aggiornata la lista degli utenti

---

## 📞 Supporto

Se hai problemi:
1. Controlla i logs nella console del browser (F12)
2. Verifica che l'utente esista in `auth.users`
3. Verifica che il profilo esista in `users_profiles`
4. Controlla che `is_active = true`
5. Verifica i permessi specifici

---

**Sistema di autenticazione pronto all'uso! 🎉**
