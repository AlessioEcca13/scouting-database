#!/usr/bin/env python3
"""
Test per verificare le abbreviazioni dei ruoli
"""

from transfermarkt_scraper import get_role_abbreviation

# Test cases con posizioni da Transfermarkt
test_cases = [
    # Portieri
    ("Portiere", "POR"),
    ("Goalkeeper", "POR"),
    
    # Difensori
    ("Difesa - Difensore centrale", "DC"),
    ("Difesa - Terzino sinistro", "TS"),
    ("Difesa - Terzino destro", "TD"),
    ("Left-Back", "TS"),
    ("Right-Back", "TD"),
    ("Centre-Back", "DC"),
    
    # Esterni
    ("Difesa - Esterno sinistro", "ES"),
    ("Difesa - Esterno destro", "ED"),
    ("Esterno di sinistra", "ES"),
    ("Left Wing-Back", "ES"),
    
    # Centrocampo
    ("Centrocampo - Mediano", "MED"),
    ("Centrocampo - Centrocampista", "CC"),
    ("Defensive Midfield", "MED"),
    ("Central Midfield", "CC"),
    ("Attacking Midfield", "TRQ"),
    
    # Ali
    ("Attacco - Ala sinistra", "AS"),
    ("Attacco - Ala destra", "AD"),
    ("Left Winger", "AS"),
    ("Right Winger", "AD"),
    
    # Attaccanti
    ("Attacco - Attaccante", "ATT"),
    ("Attacco - Seconda punta", "SP"),
    ("Centre-Forward", "ATT"),
    ("Second Striker", "SP"),
    ("Striker", "ATT"),
]

print("=" * 70)
print("🧪 TEST ABBREVIAZIONI RUOLI")
print("=" * 70)
print()

passed = 0
failed = 0

for position, expected_abbr in test_cases:
    result = get_role_abbreviation(position)
    status = "✅" if result == expected_abbr else "❌"
    
    if result == expected_abbr:
        passed += 1
    else:
        failed += 1
    
    print(f"{status} {position:40s} → {result:5s} (atteso: {expected_abbr})")

print()
print("=" * 70)
print(f"Risultati: {passed} passati, {failed} falliti su {len(test_cases)} test")
print("=" * 70)

# Test caso reale: James Penrice
print("\n🔍 Test caso reale: James Penrice")
print("-" * 70)
penrice_positions = [
    "Difesa - Terzino sinistro",
    "Terzino sinistro",
    "Esterno di sinistra"
]

for pos in penrice_positions:
    abbr = get_role_abbreviation(pos)
    print(f"  {pos:35s} → {abbr}")
