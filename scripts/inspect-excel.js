const XLSX = require('xlsx');

function inspectExcel(filePath) {
    console.log('🔍 Ispezione file Excel:', filePath);
    
    try {
        // Leggi il file Excel
        const workbook = XLSX.readFile(filePath);
        console.log('📋 Fogli disponibili:', workbook.SheetNames);
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`\n📊 Foglio "${sheetName}" - ${rawData.length} righe`);
        
        if (rawData.length > 0) {
            console.log('\n🔑 Colonne trovate:');
            Object.keys(rawData[0]).forEach((key, index) => {
                console.log(`  ${index + 1}. "${key}"`);
            });
            
            console.log('\n📝 Primi 2 record:');
            rawData.slice(0, 2).forEach((row, index) => {
                console.log(`\n--- Record ${index + 1} ---`);
                Object.entries(row).forEach(([key, value]) => {
                    console.log(`  ${key}: ${value}`);
                });
            });
        }
        
    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

// Esegui ispezione
if (process.argv.length < 3) {
    console.log('Uso: node inspect-excel.js <percorso-file-excel>');
    process.exit(1);
}

const excelFile = process.argv[2];
inspectExcel(excelFile);
