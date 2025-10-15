# ⚽ Scouting Database - Football Scouting App

Applicazione web per lo scouting calcistico con gestione giocatori, report, liste e campo tattico.

## 🚀 Quick Start

### Sviluppo Locale

```bash
cd scouting-app
npm install
npm start
```

L'app sarà disponibile su http://localhost:3000

### Build Produzione

```bash
cd scouting-app
npm run build
```

## 📁 Struttura Progetto

```
scouting-database/
├── scouting-app/          # Applicazione React principale
├── database/              # Script SQL e migrazioni
├── scripts/               # Script di utilità
└── vercel.json            # Configurazione deploy Vercel
```

## ⚙️ Configurazione

### Variabili d'Ambiente

Crea un file `.env` in `scouting-app/`:

```env
REACT_APP_SUPABASE_URL=https://tuo-progetto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tua-chiave-anonima
```

### Database Supabase

1. Vai su https://supabase.com/dashboard
2. Crea un nuovo progetto
3. Esegui gli script SQL in `database/migration/`
4. Configura le variabili d'ambiente

## 🌐 Deploy su Vercel

### Configurazione Build

- **Build Command:** `cd scouting-app && npm run build`
- **Output Directory:** `scouting-app/build`
- **Install Command:** `cd scouting-app && npm install`

### Variabili d'Ambiente Vercel

Aggiungi su Vercel Dashboard → Settings → Environment Variables:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## ✨ Funzionalità

- 🔐 Sistema di autenticazione con ruoli
- 📊 Dashboard con statistiche
- 👥 Database giocatori con ricerca avanzata
- 📝 Sistema di report dettagliati
- 📋 Gestione liste personalizzate
- ⚽ Campo tattico interattivo
- 🔄 Integrazione Transfermarkt

## 📚 Documentazione

Per istruzioni dettagliate sul deploy, consulta `DEPLOY_INSTRUCTIONS.md`

## 🛠️ Tecnologie

- **Frontend:** React, TailwindCSS
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Vercel
- **Autenticazione:** Supabase Auth

## 📄 Licenza

Progetto privato - Tutti i diritti riservati
