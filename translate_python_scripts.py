#!/usr/bin/env python3
"""
Translate all Python scripts from Italian to English
Translates print statements, comments, and error messages
"""

import os
import re
from pathlib import Path

# Translation mappings
TRANSLATIONS = {
    # Common terms
    'Lingua rilevata': 'Detected language',
    'Downloading data for player ID': 'Downloading data for player ID',
    'Data extracted successfully for': 'Data extracted successfully for',
    'Fields extracted': 'Fields extracted',
    'Dati estratti per': 'Data extracted for',
    'Lingua originale': 'Source language',
    'Dati estratti con successo': 'Data extracted successfully',
    'Errore': 'Error',
    'Errore durante lo scraping': 'Error during scraping',
    'Errore estrazione': 'Extraction error',
    'Errore di rete': 'Network error',
    'Errore parsing data': 'Error parsing date',
    'Errore parsing valore': 'Error parsing value',
    
    # Scraper messages
    'Richiesta scraping da': 'Scraping request from',
    'Dati estratti con successo per': 'Data successfully extracted for',
    'Impossibile estrarre dati': 'Unable to extract data',
    'Nessun giocatore trovato': 'No player found',
    'ID giocatore non trovato': 'Player ID not found',
    
    # Field labels
    'Nome': 'Name',
    'Posizione': 'Position',
    'Ruolo generale': 'General role',
    'Posizione specifica': 'Specific position',
    'Altre posizioni': 'Other positions',
    'Nazionalità': 'Nationality',
    'Piede': 'Foot',
    'Altezza': 'Height',
    'Anno nascita': 'Birth year',
    'Squadra': 'Team',
    'Valore': 'Value',
    
    # Test messages
    'Testing': 'Testing',
    'Test': 'Test',
    'Risultato': 'Result',
    'Completato': 'Completed',
    'Successo': 'Success',
    'Fallito': 'Failed',
    
    # API messages
    'Server running on': 'Server running on',
    'Endpoint': 'Endpoint',
    'Health check': 'Health check',
    'Transfermarkt Scraper API is running': 'Transfermarkt Scraper API is running',
    
    # Status
    'OK': 'OK',
    'Errore connessione': 'Connection error',
    'Timeout': 'Timeout',
    
    # Emojis context
    'Giocatori caricati': 'Players loaded',
    'Ricerca': 'Search',
    'risultati su': 'results out of',
    'giocatori': 'players',
}

def translate_line(line):
    """Translate a single line"""
    original = line
    
    # Translate within strings (both single and double quotes)
    for italian, english in TRANSLATIONS.items():
        # Pattern for strings
        patterns = [
            (f'"{italian}"', f'"{english}"'),
            (f"'{italian}'", f"'{english}'"),
            (f'"{italian}:', f'"{english}:'),
            (f"'{italian}:", f"'{english}:"),
            (f'f"{italian}', f'f"{english}'),
            (f"f'{italian}", f"f'{english}"),
        ]
        
        for pattern, replacement in patterns:
            if pattern in line:
                line = line.replace(pattern, replacement)
    
    return line

def translate_file(file_path):
    """Translate a Python file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        translated_lines = []
        changes = 0
        
        for line in lines:
            translated = translate_line(line)
            if translated != line:
                changes += 1
            translated_lines.append(translated)
        
        if changes > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(translated_lines)
        
        return changes
        
    except Exception as e:
        print(f"❌ Error in {file_path.name}: {e}")
        return 0

def main():
    """Translate all Python scripts"""
    base_dir = Path('/Users/alessioecca/windsurf/scouting_database')
    
    # Files to translate
    files_to_translate = [
        'transfermarkt_multilang_scraper.py',
        'integrate_multilang_to_db.py',
        'scraper_api.py',
        'test_multilang_scraper.py',
    ]
    
    print("🌍 TRANSLATING PYTHON SCRIPTS: ITALIAN → ENGLISH")
    print("=" * 80)
    
    total_changes = 0
    
    for file_name in files_to_translate:
        file_path = base_dir / file_name
        
        if not file_path.exists():
            print(f"\n⏭️  {file_name} - File not found")
            continue
        
        print(f"\n📝 Translating: {file_name}")
        changes = translate_file(file_path)
        
        if changes > 0:
            print(f"   ✅ {changes} translations applied")
            total_changes += changes
        else:
            print(f"   ⏭️  No changes needed")
    
    print("\n" + "=" * 80)
    print(f"✅ COMPLETED!")
    print(f"   Total translations: {total_changes}")
    print("=" * 80)

if __name__ == "__main__":
    main()
