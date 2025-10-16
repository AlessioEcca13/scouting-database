#!/usr/bin/env python3
"""
Test dello scraper per verificare estrazione altezza e peso
"""

import sys
from transfermarkt_scraper import TransfermarktScraper

def test_player_extraction(url):
    """
    Testa l'estrazione dei dati di un giocatore
    """
    print("=" * 70)
    print("🔍 TEST ESTRAZIONE DATI GIOCATORE")
    print("=" * 70)
    print(f"\n📍 URL: {url}\n")
    
    # Crea scraper
    scraper = TransfermarktScraper()
    
    # Estrai dati
    print("⏳ Estrazione in corso...\n")
    player_data = scraper.get_player_info(url)
    
    # Verifica errori
    if 'error' in player_data:
        print(f"❌ ERRORE: {player_data['error']}")
        return
    
    # Mostra dati estratti
    print("=" * 70)
    print("📊 DATI ESTRATTI:")
    print("=" * 70)
    print()
    
    # Dati principali
    print(f"👤 Nome: {player_data.get('name', 'N/D')}")
    print(f"🎂 Età: {player_data.get('age', 'N/D')}")
    print(f"📅 Anno nascita: {player_data.get('birth_year', 'N/D')}")
    print(f"📍 Luogo nascita: {player_data.get('birth_place', 'N/D')}")
    print(f"🏴 Nazionalità: {player_data.get('nationality_primary', 'N/D')}")
    print()
    
    # DATI FISICI - FOCUS DEL TEST
    print("=" * 70)
    print("📏 DATI FISICI (FOCUS):")
    print("=" * 70)
    print()
    
    height_raw = player_data.get('height_raw', 'NON TROVATO')
    height_cm = player_data.get('height_cm', 'NON CALCOLATO')
    weight_raw = player_data.get('weight_raw', 'NON TROVATO')
    weight_kg = player_data.get('weight_kg', 'NON CALCOLATO')
    
    print(f"📏 Altezza (raw): {height_raw}")
    print(f"📏 Altezza (cm):  {height_cm}")
    print()
    print(f"⚖️  Peso (raw):    {weight_raw}")
    print(f"⚖️  Peso (kg):     {weight_kg}")
    print()
    
    # Verifica se i dati sono stati estratti
    if height_cm == 'NON CALCOLATO' or height_cm is None:
        print("⚠️  PROBLEMA: Altezza non estratta!")
    else:
        print(f"✅ Altezza estratta correttamente: {height_cm} cm")
    
    if weight_kg == 'NON CALCOLATO' or weight_kg is None:
        print("⚠️  PROBLEMA: Peso non estratto!")
    else:
        print(f"✅ Peso estratto correttamente: {weight_kg} kg")
    
    print()
    
    # Altri dati
    print("=" * 70)
    print("⚽ ALTRI DATI:")
    print("=" * 70)
    print()
    
    print(f"🎽 Numero maglia: {player_data.get('shirt_number', 'N/D')}")
    print(f"⚽ Posizione: {player_data.get('position', 'N/D')}")
    print(f"🦶 Piede preferito: {player_data.get('preferred_foot', 'N/D')}")
    print(f"💰 Valore mercato: {player_data.get('market_value', 'N/D')}")
    print(f"🏢 Club: {player_data.get('current_club', 'N/D')}")
    print(f"📅 Scadenza contratto: {player_data.get('contract_expiry', 'N/D')}")
    print()
    
    # Posizioni alternative
    print("=" * 70)
    print("🎯 POSIZIONI:")
    print("=" * 70)
    print()
    
    print(f"⭐ Posizione naturale: {player_data.get('natural_position', 'N/D')}")
    print(f"🔄 Altre posizioni: {player_data.get('other_positions', 'N/D')}")
    print()
    
    # Coordinate campo
    field_x = player_data.get('field_position_x')
    field_y = player_data.get('field_position_y')
    
    if field_x is not None and field_y is not None:
        print(f"📍 Coordinate campo: X={field_x}, Y={field_y}")
    else:
        print("📍 Coordinate campo: Non disponibili")
    
    print()
    print("=" * 70)
    print("✅ TEST COMPLETATO")
    print("=" * 70)


if __name__ == "__main__":
    # URL di test - Penrice
    test_url = "https://www.transfermarkt.it/james-penrice/profil/spieler/567497"
    
    if len(sys.argv) > 1:
        test_url = sys.argv[1]
    
    test_player_extraction(test_url)
