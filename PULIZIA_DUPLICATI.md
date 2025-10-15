# 🧹 Guida: Pulizia Giocatori Duplicati

## ⚠️ Problema

Nel database ci sono giocatori con lo **stesso nome** ma **ID diversi**. Questo accade quando:
- Un giocatore viene inserito più volte manualmente
- Ci sono errori nell'importazione dati
- Non c'è un constraint UNIQUE sul nome

**Esempio:**
```
id: 123 | name: "James Penrice" | team: "AEK Atene"
id: 456 | name: "James Penrice" | team: "AEK Atene"  ← DUPLICATO
```

---

## ✅ Soluzione Implementata

### **1. Frontend (Già Fatto)**

Il componente `PlayerLists.js` ora:
- ✅ **Filtra automaticamente** i duplicati
- ✅ **Mantiene il record più recente** (ID più alto)
- ✅ **Mostra solo giocatori unici** nella lista

**Codice:**
```javascript
const uniquePlayers = players.reduce((acc, player) => {
  const existingIndex = acc.findIndex(p => 
    p.name?.toLowerCase() === player.name?.toLowerCase()
  );
  
  if (existingIndex === -1) {
    acc.push(player);
  } else {
    // Mantiene quello con ID più alto (più recente)
    if (player.id > acc[existingIndex].id) {
      acc[existingIndex] = player;
    }
  }
  return acc;
}, []);
```

---

## 🗄️ Pulizia Database (Raccomandato)

### **Passo 1: Verifica Duplicati**

Esegui in Supabase SQL Editor:

```sql
-- Mostra tutti i giocatori duplicati
SELECT name, COUNT(*) as count, STRING_AGG(id::text, ', ') as ids
FROM players
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;
```

**Output esempio:**
```
name            | count | ids
----------------|-------|------------------
James Penrice   | 2     | 123, 456
Kike Salas      | 3     | 789, 790, 791
```

---

### **Passo 2: Elimina Duplicati**

⚠️ **ATTENZIONE:** Questa operazione è **irreversibile**!

```sql
-- Elimina duplicati mantenendo solo il record più recente
DELETE FROM players a
USING (
  SELECT name, MAX(id) as max_id
  FROM players
  GROUP BY name
  HAVING COUNT(*) > 1
) b
WHERE a.name = b.name
AND a.id < b.max_id;
```

**Cosa fa:**
- Trova tutti i giocatori con lo stesso nome
- Mantiene solo quello con l'ID più alto (più recente)
- Elimina tutti gli altri

---

### **Passo 3: Previeni Futuri Duplicati**

```sql
-- Aggiungi constraint UNIQUE sul nome
ALTER TABLE players
ADD CONSTRAINT players_name_unique UNIQUE (name);
```

**Effetto:**
- ✅ Non sarà più possibile inserire due giocatori con lo stesso nome
- ✅ Supabase restituirà un errore se provi a inserire un duplicato

---

### **Passo 4: Verifica Finale**

```sql
-- Controlla che non ci siano più duplicati
SELECT name, COUNT(*) as count
FROM players
GROUP BY name
HAVING COUNT(*) > 1;
```

**Risultato atteso:** `0 rows` (nessun duplicato)

---

## 🔄 Alternativa: Duplicati con Team Diverso

Se vuoi permettere lo **stesso nome** ma con **team diverso**:

```sql
-- Rimuovi il constraint precedente (se esiste)
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_name_unique;

-- Aggiungi constraint su nome + team
ALTER TABLE players
ADD CONSTRAINT players_name_team_unique UNIQUE (name, team);
```

**Esempio permesso:**
```
✅ name: "James Penrice" | team: "AEK Atene"
✅ name: "James Penrice" | team: "Hearts"      ← OK, team diverso
❌ name: "James Penrice" | team: "AEK Atene"   ← ERRORE, duplicato
```

---

## 📊 Statistiche Duplicati

Dopo aver eseguito la pulizia, verifica quanti record sono stati eliminati:

```sql
-- Prima della pulizia
SELECT COUNT(*) as total_before FROM players;

-- Esegui la pulizia...

-- Dopo la pulizia
SELECT COUNT(*) as total_after FROM players;

-- Calcola differenza
SELECT 
  (SELECT COUNT(*) FROM players) as total_after,
  -- Inserisci qui il numero "total_before"
  123 - (SELECT COUNT(*) FROM players) as duplicates_removed;
```

---

## 🎯 Riepilogo

### **Cosa Succede Ora:**

1. ✅ **Frontend**: Mostra solo giocatori unici (anche se ci sono duplicati nel DB)
2. ✅ **Database**: Puoi pulire i duplicati con lo script SQL
3. ✅ **Prevenzione**: Constraint UNIQUE impedisce nuovi duplicati

### **Raccomandazioni:**

- 🟢 **Esegui la pulizia** se hai molti duplicati
- 🟢 **Aggiungi il constraint** per prevenire futuri problemi
- 🟡 **Backup prima** di eseguire DELETE (opzionale ma consigliato)

---

## 🔧 Script Completo

File: `/database/migration/fix_duplicate_players.sql`

Contiene tutti i comandi SQL necessari per:
1. Verificare duplicati
2. Eliminarli
3. Aggiungere constraint
4. Verificare risultato

---

**Tutto pronto per un database pulito e senza duplicati!** 🎉
