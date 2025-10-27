#!/usr/bin/env python3
"""
Script per tradurre l'app React da italiano a inglese
Applica traduzioni automatiche ai file .js
"""

import os
import re
from pathlib import Path

# Mappatura traduzioni (italiano → inglese)
TRANSLATIONS = {
    # Ruoli
    'Portiere': 'Goalkeeper',
    'Difensore': 'Defender',
    'Centrocampista': 'Midfielder',
    'Attaccante': 'Forward',
    
    # Termini comuni
    'Cerca': 'Search',
    'Filtra': 'Filter',
    'Aggiungi': 'Add',
    'Modifica': 'Edit',
    'Elimina': 'Delete',
    'Salva': 'Save',
    'Annulla': 'Cancel',
    'Chiudi': 'Close',
    'Conferma': 'Confirm',
    'Carica': 'Load',
    'Scarica': 'Download',
    'Esporta': 'Export',
    'Importa': 'Import',
    'Visualizza': 'View',
    'Dettagli': 'Details',
    'Azioni': 'Actions',
    'Tutti': 'All',
    'Nessuno': 'None',
    'Seleziona': 'Select',
    'Rimuovi': 'Remove',
    'Svuota': 'Clear',
    
    # Campi giocatore
    'Nome': 'Name',
    'Cognome': 'Surname',
    'Data di nascita': 'Date of Birth',
    'Anno di nascita': 'Birth Year',
    'Età': 'Age',
    'Nazionalità': 'Nationality',
    'Altezza': 'Height',
    'Peso': 'Weight',
    'Piede': 'Foot',
    'Piede preferito': 'Preferred Foot',
    'Squadra': 'Club',
    'Ruolo': 'Position',
    'Ruolo generale': 'General Position',
    'Posizione specifica': 'Specific Position',
    'Altre posizioni': 'Other Positions',
    'Numero maglia': 'Shirt Number',
    'Valore di mercato': 'Market Value',
    'Contratto': 'Contract',
    'Scadenza contratto': 'Contract Expiry',
    'Note': 'Notes',
    'Valutazione': 'Rating',
    'Potenziale': 'Potential',
    
    # Piede
    'Destro': 'Right',
    'Sinistro': 'Left',
    'Ambidestro': 'Both',
    'destro': 'right',
    'sinistro': 'left',
    'ambidestro': 'both',
    
    # Dashboard
    'Benvenuto': 'Welcome',
    'Statistiche': 'Statistics',
    'Giocatori totali': 'Total Players',
    'Report totali': 'Total Reports',
    'Liste attive': 'Active Lists',
    'Ultimi giocatori aggiunti': 'Recently Added Players',
    'Report recenti': 'Recent Reports',
    'Visualizza tutto': 'View All',
    'Nessun dato disponibile': 'No data available',
    
    # Database
    'Database Giocatori': 'Player Database',
    'Cerca giocatore': 'Search player',
    'Filtra per ruolo': 'Filter by position',
    'Filtra per squadra': 'Filter by club',
    'Filtra per nazionalità': 'Filter by nationality',
    'Aggiungi giocatore': 'Add Player',
    'Modifica giocatore': 'Edit Player',
    'Elimina giocatore': 'Delete Player',
    'Giocatori trovati': 'Players found',
    'Nessun giocatore trovato': 'No players found',
    'Caricamento': 'Loading',
    'Giocatori nel database': 'Players in database',
    
    # Liste
    'Le mie liste': 'My Lists',
    'Crea nuova lista': 'Create New List',
    'Nome lista': 'List Name',
    'Descrizione': 'Description',
    'Giocatori nella lista': 'Players in list',
    'Aggiungi a lista': 'Add to List',
    'Rimuovi da lista': 'Remove from List',
    'Lista vuota': 'Empty list',
    'Elimina lista': 'Delete List',
    
    # Report
    'Report': 'Reports',
    'Nuovo report': 'New Report',
    'Visualizza report': 'View Report',
    'Modifica report': 'Edit Report',
    'Elimina report': 'Delete Report',
    'Data report': 'Report Date',
    'Autore': 'Author',
    'Valutazione complessiva': 'Overall Rating',
    'Punti di forza': 'Strengths',
    'Punti deboli': 'Weaknesses',
    'Conclusioni': 'Conclusion',
    'Raccomandazioni': 'Recommendations',
    
    # Campo Tattico
    'Campo Tattico': 'Tactical Board',
    'Modulo': 'Formation',
    'Posiziona giocatori': 'Position players',
    'Salva formazione': 'Save Formation',
    'Carica formazione': 'Load Formation',
    'Svuota campo': 'Clear Field',
    'Colore campo': 'Field Color',
    'Mostra attributi': 'Show Attributes',
    'Legenda colori': 'Color Legend',
    'Importa da liste': 'Import from Lists',
    'Risultati ricerca': 'Search Results',
    'Trascina qui': 'Drag here',
    'Giocatori posizionati': 'Positioned Players',
    'Formazioni salvate': 'Saved Formations',
    
    # Colori
    'Verde': 'Green',
    'Blu': 'Blue',
    'Rosso': 'Red',
    'Giallo': 'Yellow',
    'Arancione': 'Orange',
    'Viola': 'Purple',
    'Rosa': 'Pink',
    'Grigio': 'Gray',
    'Verde Classico': 'Classic Green',
    
    # Filtri
    'Tutti i ruoli': 'All Positions',
    'Tutte le squadre': 'All Clubs',
    'Tutte le nazionalità': 'All Nationalities',
    'Ordina per': 'Sort by',
    'Data aggiunta': 'Date Added',
    'Crescente': 'Ascending',
    'Decrescente': 'Descending',
    
    # Messaggi
    'Operazione completata': 'Operation completed',
    'Errore durante l\'operazione': 'Error during operation',
    'Giocatore aggiunto con successo': 'Player added successfully',
    'Giocatore modificato con successo': 'Player updated successfully',
    'Giocatore eliminato con successo': 'Player deleted successfully',
    'Report salvato con successo': 'Report saved successfully',
    'Lista creata con successo': 'List created successfully',
    'Formazione salvata con successo': 'Formation saved successfully',
    'Dati importati con successo': 'Data imported successfully',
    'Sei sicuro di voler eliminare': 'Are you sure you want to delete',
    'Questa azione non può essere annullata': 'This action cannot be undone',
    'Campo obbligatorio': 'Required field',
    'Valore non valido': 'Invalid value',
    
    # Attributi
    'Attributi Tecnici': 'Technical Attributes',
    'Attributi Fisici': 'Physical Attributes',
    'Attributi Mentali': 'Mental Attributes',
    'Attributi Tattici': 'Tactical Attributes',
    'Controllo palla': 'Ball Control',
    'Dribbling': 'Dribbling',
    'Passaggio': 'Passing',
    'Tiro': 'Shooting',
    'Primo tocco': 'First Touch',
    'Tecnica': 'Technique',
    'Colpo di testa': 'Heading',
    'Cross': 'Crossing',
    'Calci piazzati': 'Set Pieces',
    'Velocità': 'Pace',
    'Accelerazione': 'Acceleration',
    'Resistenza': 'Stamina',
    'Forza': 'Strength',
    'Agilità': 'Agility',
    'Equilibrio': 'Balance',
    'Salto': 'Jumping',
    'Visione di gioco': 'Vision',
    'Decisioni': 'Decision Making',
    'Concentrazione': 'Concentration',
    'Determinazione': 'Determination',
    'Lavoro di squadra': 'Teamwork',
    'Leadership': 'Leadership',
    'Aggressività': 'Aggression',
    'Posizionamento': 'Positioning',
    'Marcatura': 'Marking',
    'Tackle': 'Tackling',
    'Intercettamento': 'Interception',
    'Copertura': 'Covering',
    'Anticipazione': 'Anticipation',
    
    # Azioni
    'Azioni Rapide': 'Quick Actions',
    'Personalizzazione': 'Customization',
}


def translate_file(file_path):
    """Traduce un file React da italiano a inglese"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes = 0
        
        # Applica traduzioni
        for italian, english in TRANSLATIONS.items():
            # Cerca pattern: "testo italiano" o 'testo italiano' o >testo italiano<
            patterns = [
                (f'"{italian}"', f'"{english}"'),
                (f"'{italian}'", f"'{english}'"),
                (f'>{italian}<', f'>{english}<'),
                (f'`{italian}`', f'`{english}`'),
            ]
            
            for pattern_it, pattern_en in patterns:
                if pattern_it in content:
                    content = content.replace(pattern_it, pattern_en)
                    changes += 1
        
        # Salva solo se ci sono modifiche
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return changes
        
        return 0
        
    except Exception as e:
        print(f"❌ Errore in {file_path}: {e}")
        return 0


def main():
    """Traduce tutti i file React"""
    components_dir = Path('/Users/alessioecca/windsurf/scouting_database/scouting-app/src/components')
    
    if not components_dir.exists():
        print(f"❌ Directory non trovata: {components_dir}")
        return
    
    print("🌍 TRADUZIONE APP REACT: ITALIANO → INGLESE")
    print("=" * 80)
    
    total_files = 0
    total_changes = 0
    
    # Trova tutti i file .js
    for file_path in components_dir.glob('*.js'):
        if file_path.name == 'Navigation.js':
            print(f"⏭️  Saltato {file_path.name} (già tradotto)")
            continue
        
        print(f"\n📝 Traduzione: {file_path.name}")
        changes = translate_file(file_path)
        
        if changes > 0:
            print(f"   ✅ {changes} traduzioni applicate")
            total_files += 1
            total_changes += changes
        else:
            print(f"   ⏭️  Nessuna traduzione necessaria")
    
    print("\n" + "=" * 80)
    print(f"✅ COMPLETATO!")
    print(f"   File modificati: {total_files}")
    print(f"   Traduzioni totali: {total_changes}")
    print("=" * 80)


if __name__ == "__main__":
    main()
