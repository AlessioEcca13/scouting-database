#!/usr/bin/env python3
"""
Test per verificare la mappatura dei ruoli generali
Devono corrispondere ai 6 ruoli disponibili nel sistema
"""

from transfermarkt_scraper import map_position_to_role

# Test cases con posizioni da Transfermarkt
test_cases = [
    # Portieri → Portiere
    ("Portiere", "Portiere"),
    ("Goalkeeper", "Portiere"),
    ("GK", "Portiere"),
    
    # Difensori centrali → Difensore
    ("Difesa - Difensore centrale", "Difensore"),
    ("Difensore centrale", "Difensore"),
    ("Centre-Back", "Difensore"),
    ("CB", "Difensore"),
    
    # Terzini ed esterni → Terzino
    ("Difesa - Terzino sinistro", "Terzino"),
    ("Difesa - Terzino destro", "Terzino"),
    ("Terzino sinistro", "Terzino"),
    ("Left-Back", "Terzino"),
    ("Right-Back", "Terzino"),
    ("LB", "Terzino"),
    ("RB", "Terzino"),
    ("Esterno sinistro", "Terzino"),
    ("Esterno di sinistra", "Terzino"),
    ("Left Wing-Back", "Terzino"),
    ("Right Wing-Back", "Terzino"),
    ("LWB", "Terzino"),
    ("RWB", "Terzino"),
    
    # Centrocampisti → Centrocampo
    ("Centrocampo - Mediano", "Centrocampo"),
    ("Centrocampo - Centrocampista", "Centrocampo"),
    ("Mediano", "Centrocampo"),
    ("Defensive Midfield", "Centrocampo"),
    ("Central Midfield", "Centrocampo"),
    ("Attacking Midfield", "Centrocampo"),
    ("CDM", "Centrocampo"),
    ("CM", "Centrocampo"),
    ("CAM", "Centrocampo"),
    ("Trequartista", "Centrocampo"),
    ("Mezzala sinistra", "Centrocampo"),
    
    # Ali → Ala
    ("Attacco - Ala sinistra", "Ala"),
    ("Attacco - Ala destra", "Ala"),
    ("Ala sinistra", "Ala"),
    ("Left Winger", "Ala"),
    ("Right Winger", "Ala"),
    ("LW", "Ala"),
    ("RW", "Ala"),
    
    # Attaccanti → Attaccante
    ("Attacco - Attaccante", "Attaccante"),
    ("Attacco - Seconda punta", "Attaccante"),
    ("Attaccante", "Attaccante"),
    ("Centre-Forward", "Attaccante"),
    ("Second Striker", "Attaccante"),
    ("Striker", "Attaccante"),
    ("ST", "Attaccante"),
    ("CF", "Attaccante"),
    ("SS", "Attaccante"),
    ("Punta", "Attaccante"),
]

print("=" * 80)
print("🧪 TEST MAPPATURA RUOLI GENERALI")
print("=" * 80)
print("\n📋 Ruoli generali disponibili:")
print("   1. Portiere")
print("   2. Difensore")
print("   3. Terzino")
print("   4. Centrocampo")
print("   5. Ala")
print("   6. Attaccante")
print("\n" + "=" * 80)
print()

passed = 0
failed = 0
errors_by_role = {}

for position, expected_role in test_cases:
    result = map_position_to_role(position)
    status = "✅" if result == expected_role else "❌"
    
    if result == expected_role:
        passed += 1
    else:
        failed += 1
        if expected_role not in errors_by_role:
            errors_by_role[expected_role] = []
        errors_by_role[expected_role].append((position, result))
    
    print(f"{status} {position:40s} → {result:15s} (atteso: {expected_role})")

print()
print("=" * 80)
print(f"📊 Risultati: {passed} passati, {failed} falliti su {len(test_cases)} test")
print("=" * 80)

if errors_by_role:
    print("\n❌ ERRORI PER RUOLO:")
    for role, errors in errors_by_role.items():
        print(f"\n  {role}:")
        for pos, got in errors:
            print(f"    - '{pos}' → '{got}' (dovrebbe essere '{role}')")

# Test caso reale: James Penrice
print("\n" + "=" * 80)
print("🔍 TEST CASO REALE: James Penrice")
print("=" * 80)

penrice_tests = [
    ("Difesa - Terzino sinistro", "Terzino", "TS"),
    ("Terzino sinistro", "Terzino", "TS"),
    ("Esterno di sinistra", "Terzino", "ES")
]

from transfermarkt_scraper import get_role_abbreviation

for pos, expected_general, expected_abbr in penrice_tests:
    general = map_position_to_role(pos)
    abbr = get_role_abbreviation(pos)
    general_ok = "✅" if general == expected_general else "❌"
    abbr_ok = "✅" if abbr == expected_abbr else "❌"
    
    print(f"\nPosizione: {pos}")
    print(f"  {general_ok} Ruolo generale: {general} (atteso: {expected_general})")
    print(f"  {abbr_ok} Abbreviazione: {abbr} (atteso: {expected_abbr})")

print("\n" + "=" * 80)
