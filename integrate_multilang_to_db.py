#!/usr/bin/env python3
"""
Integrazione Scraper Multilingua con Database
Estrae dati da Transfermarkt (qualsiasi lingua) e salva in formato database inglese
"""

from transfermarkt_multilang_scraper import MultiLangTransfermarktScraper

# Mapping ruoli inglesi -> abbreviazioni database
POSITION_TO_ABBREVIATION = {
    # Portieri
    'Goalkeeper': 'POR',
    'GK': 'POR',
    
    # Difensori
    'Centre-Back': 'DC',
    'Left Centre-Back': 'DCS',
    'Right Centre-Back': 'DCD',
    'Left-Back': 'TS',
    'Right-Back': 'TD',
    'Left Wing-Back': 'ES',
    'Right Wing-Back': 'ED',
    
    # Centrocampisti
    'Defensive Midfield': 'MED',
    'Central Midfield': 'CC',
    'Left Midfield': 'CS',
    'Right Midfield': 'CD',
    'Attacking Midfield': 'TRQ',
    
    # Attaccanti
    'Left Winger': 'AS',
    'Right Winger': 'AD',
    'Second Striker': 'SP',
    'Centre-Forward': 'ATT',
}

# Mapping ruoli -> ruolo generale
POSITION_TO_GENERAL_ROLE = {
    'Goalkeeper': 'Portiere',
    'Centre-Back': 'Difensore',
    'Left Centre-Back': 'Difensore',
    'Right Centre-Back': 'Difensore',
    'Left-Back': 'Difensore',
    'Right-Back': 'Difensore',
    'Left Wing-Back': 'Difensore',
    'Right Wing-Back': 'Difensore',
    'Defensive Midfield': 'Centrocampista',
    'Central Midfield': 'Centrocampista',
    'Left Midfield': 'Centrocampista',
    'Right Midfield': 'Centrocampista',
    'Attacking Midfield': 'Centrocampista',
    'Left Winger': 'Attaccante',
    'Right Winger': 'Attaccante',
    'Second Striker': 'Attaccante',
    'Centre-Forward': 'Attaccante',
}


def map_position_to_abbreviation(position_english: str) -> str:
    """Converte ruolo inglese in abbreviazione database"""
    if not position_english:
        return None
    
    # Cerca match esatto
    if position_english in POSITION_TO_ABBREVIATION:
        return POSITION_TO_ABBREVIATION[position_english]
    
    # Cerca match parziale
    for key, abbr in POSITION_TO_ABBREVIATION.items():
        if key.lower() in position_english.lower() or position_english.lower() in key.lower():
            return abbr
    
    # Fallback: prime 3 lettere
    return position_english[:3].upper()


def map_position_to_general_role(position_english: str) -> str:
    """Converte ruolo inglese in ruolo generale italiano"""
    if not position_english:
        return None
    
    # Cerca match esatto
    if position_english in POSITION_TO_GENERAL_ROLE:
        return POSITION_TO_GENERAL_ROLE[position_english]
    
    # Cerca match parziale
    for key, role in POSITION_TO_GENERAL_ROLE.items():
        if key.lower() in position_english.lower():
            return role
    
    # Fallback
    if 'back' in position_english.lower() or 'defender' in position_english.lower():
        return 'Difensore'
    elif 'midfield' in position_english.lower():
        return 'Centrocampista'
    elif 'forward' in position_english.lower() or 'striker' in position_english.lower() or 'winger' in position_english.lower():
        return 'Attaccante'
    elif 'goalkeeper' in position_english.lower():
        return 'Portiere'
    
    return 'Sconosciuto'


def extract_and_map_to_database(url: str) -> dict:
    """
    Estrae dati da Transfermarkt (qualsiasi lingua) e mappa al formato database
    
    Args:
        url: URL Transfermarkt in qualsiasi lingua
        
    Returns:
        Dizionario pronto per inserimento in database
    """
    scraper = MultiLangTransfermarktScraper()
    
    print(f"🔗 URL: {url}")
    
    # Estrai dati (tradotti in inglese)
    raw_data = scraper.get_player_info(url)
    
    if 'error' in raw_data:
        print(f"❌ Errore: {raw_data['error']}")
        return None
    
    print(f"✅ Dati estratti per: {raw_data.get('name')}")
    print(f"   Lingua originale: {raw_data.get('source_language', 'unknown').upper()}")
    
    # Mappa al formato database
    db_data = {
        # Informazioni base
        'name': raw_data.get('name'),
        'birth_year': raw_data.get('birth_year'),
        'age': raw_data.get('age'),
        'height_cm': raw_data.get('height_cm'),
        
        # Nazionalità
        'nationality_primary': raw_data.get('nationality_primary'),
        
        # Ruoli (convertiti in abbreviazioni)
        'general_role': map_position_to_general_role(raw_data.get('position') or raw_data.get('natural_position')),
        'specific_position': map_position_to_abbreviation(raw_data.get('natural_position')),
        'other_positions': map_position_to_abbreviation(raw_data.get('other_positions')),
        
        # Dettagli
        'preferred_foot': raw_data.get('preferred_foot'),
        'team': raw_data.get('team'),
        'market_value': raw_data.get('market_value'),
        'contract_expiry': raw_data.get('contract_expiry'),
        
        # Media
        'profile_image': raw_data.get('profile_image'),
        
        # Metadata
        'transfermarkt_id': raw_data.get('player_id'),
        'transfermarkt_url': raw_data.get('url'),
        'source_language': raw_data.get('source_language'),
    }
    
    print(f"\n📊 DATI MAPPATI PER DATABASE:")
    print(f"   Nome: {db_data['name']}")
    print(f"   Ruolo generale: {db_data['general_role']}")
    print(f"   Posizione specifica: {db_data['specific_position']}")
    print(f"   Altre posizioni: {db_data['other_positions']}")
    print(f"   Nazionalità: {db_data['nationality_primary']}")
    print(f"   Piede: {db_data['preferred_foot']}")
    print(f"   Squadra: {db_data['team']}")
    print(f"   Valore: €{db_data['market_value']:,.0f}" if db_data['market_value'] else "   Valore: N/A")
    
    return db_data


def main():
    """Test integrazione con diverse lingue"""
    print("=" * 100)
    print("🌍 TEST INTEGRAZIONE SCRAPER MULTILINGUA → DATABASE")
    print("=" * 100)
    
    # Test URLs in diverse lingue
    test_urls = [
        "https://www.transfermarkt.it/james-penrice/profil/spieler/363227",  # Italiano
        "https://www.transfermarkt.es/james-penrice/profil/spieler/363227",  # Spagnolo
        "https://www.transfermarkt.de/james-penrice/profil/spieler/363227",  # Tedesco
    ]
    
    results = []
    
    for url in test_urls:
        print(f"\n{'='*100}")
        db_data = extract_and_map_to_database(url)
        if db_data:
            results.append(db_data)
        print(f"{'='*100}")
    
    # Verifica consistenza
    if len(results) > 1:
        print(f"\n\n{'='*100}")
        print("🔍 VERIFICA CONSISTENZA DATI")
        print(f"{'='*100}\n")
        
        print("Stesso giocatore da lingue diverse deve avere dati identici:\n")
        
        fields_to_check = ['specific_position', 'other_positions', 'general_role', 'preferred_foot']
        
        for field in fields_to_check:
            print(f"📌 {field.upper()}:")
            values = [r.get(field) for r in results]
            for i, val in enumerate(values):
                lang = results[i].get('source_language', '?').upper()
                print(f"   {lang}: {val}")
            
            if len(set(v for v in values if v)) <= 1:
                print(f"   ✅ Consistente!\n")
            else:
                print(f"   ⚠️  Valori diversi\n")
    
    print("\n" + "✅" * 50)
    print("TEST COMPLETATO!")
    print("✅" * 50)
    
    return results


if __name__ == "__main__":
    main()
