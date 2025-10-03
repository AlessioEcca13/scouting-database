const XLSX = require('xlsx');

// Dati di esempio per testare l'importazione
const sampleData = [
    {
        'Nome': 'Mario Rossi',
        'Anno': 2000,
        'Squadra': 'AC Milan',
        'Naz': 'Italia',
        'Ruolo Generale': 'Centrocampista',
        'Posizone': 'Mediano',
        'Funzioni/Etichette': 'Regia, Interdizione',
        'Piede': 'Destro',
        'Atletismo': 'Buona resistenza, velocità media',
        'Valutazione Atletica': 4,
        'Caratteristiche Chiave': 'Visione di gioco, passaggio preciso',
        'Valore Potenziale ': 4,
        'Valore Attuale  Dati': 3,
        'Valore Potenziale Dati': 4,
        'Note ': 'Giocatore promettente con buone capacità tecniche',
        'Transfermarket': 'https://www.transfermarkt.it/mario-rossi',
        'Director Feedback ': 'Positivo',
        'CHECK': 'Completato',
        'ESITO': 'Approvato'
    },
    {
        'Nome': 'Luca Bianchi',
        'Anno': 1999,
        'Squadra': 'Juventus',
        'Naz': 'Italia',
        'Ruolo Generale': 'Attaccante',
        'Posizone': 'Punta Centrale',
        'Funzioni/Etichette': 'Finalizzazione, Gioco aereo',
        'Piede': 'Sinistro',
        'Atletismo': 'Ottima forza fisica, buona velocità',
        'Valutazione Atletica': 5,
        'Caratteristiche Chiave': 'Finalizzazione, colpo di testa',
        'Valore Potenziale ': 5,
        'Valore Attuale  Dati': 4,
        'Valore Potenziale Dati': 5,
        'Note ': 'Attaccante completo con ottime prospettive',
        'Transfermarket': 'https://www.transfermarkt.it/luca-bianchi',
        'Director Feedback ': 'Molto positivo',
        'CHECK': 'Completato',
        'ESITO': 'Fortemente raccomandato'
    },
    {
        'Nome': 'Giovanni Verdi',
        'Anno': 2001,
        'Squadra': 'Inter',
        'Naz': 'Italia',
        'Ruolo Generale': 'Difensore',
        'Posizone': 'Centrale',
        'Funzioni/Etichette': 'Marcatura, Impostazione',
        'Piede': 'Ambidestro',
        'Atletismo': 'Buona statura, velocità discreta',
        'Valutazione Atletica': 3,
        'Caratteristiche Chiave': 'Lettura del gioco, passaggio lungo',
        'Valore Potenziale ': 3,
        'Valore Attuale  Dati': 3,
        'Valore Potenziale Dati': 4,
        'Note ': 'Difensore solido con margini di miglioramento',
        'Transfermarket': 'https://www.transfermarkt.it/giovanni-verdi',
        'Director Feedback ': 'Neutro',
        'CHECK': 'In corso',
        'ESITO': 'Da valutare'
    }
];

// Crea il workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData);

// Aggiungi il foglio al workbook
XLSX.utils.book_append_sheet(wb, ws, 'Giocatori');

// Salva il file
const filename = 'sample-players.xlsx';
XLSX.writeFile(wb, filename);

console.log(`✅ File Excel di esempio creato: ${filename}`);
console.log(`📊 Contiene ${sampleData.length} giocatori di esempio`);
console.log('');
console.log('Per testare l\'importazione, esegui:');
console.log(`node import-excel.js ${filename}`);
