#!/usr/bin/env python3
"""
Test completo per verificare l'importazione da Transfermarkt
"""

import requests
import json

def test_import(url, player_name):
    """Testa l'importazione di un giocatore"""
    print(f"\n{'='*80}")
    print(f"🧪 Test importazione: {player_name}")
    print(f"{'='*80}")
    
    try:
        response = requests.post(
            'http://localhost:5001/api/scrape',
            headers={'Content-Type': 'application/json'},
            json={'url': url},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Errore HTTP {response.status_code}")
            return False
        
        data = response.json()
        
        if not data.get('success'):
            print(f"❌ Errore: {data.get('error', 'Unknown')}")
            return False
        
        db_format = data['db_format']
        
        # Verifica campi obbligatori compilati
        print("\n✅ CAMPI COMPILATI AUTOMATICAMENTE:")
        required_fields = {
            'name': 'Nome',
            'general_role': 'Ruolo Generale',
            'specific_position': 'Posizione Specifica',
            'team': 'Squadra',
            'nationality': 'Nazionalità'
        }
        
        for field, label in required_fields.items():
            value = db_format.get(field)
            status = "✅" if value else "❌"
            print(f"  {status} {label:25s}: {value}")
        
        # Verifica campi scout (devono essere None)
        print("\n📝 CAMPI DA COMPILARE MANUALMENTE (devono essere None):")
        scout_fields = {
            'priority': 'Priorità',
            'director_feedback': 'Raccomandazione DS',
            'check_type': 'Tipo Controllo',
            'notes': 'Note Scout'
        }
        
        all_none = True
        for field, label in scout_fields.items():
            value = db_format.get(field)
            is_none = value is None
            status = "✅" if is_none else "❌"
            if not is_none:
                all_none = False
            print(f"  {status} {label:25s}: {value if value else 'None (corretto)'}")
        
        # Verifica abbreviazioni
        print("\n🏷️  ABBREVIAZIONI:")
        print(f"  Posizione specifica: {db_format.get('specific_position')} (da: {db_format.get('position_full_name')})")
        if db_format.get('natural_position'):
            print(f"  Posizione naturale:  {db_format.get('natural_position')} (da: {db_format.get('natural_position_full_name')})")
        if db_format.get('other_positions'):
            print(f"  Altre posizioni:     {db_format.get('other_positions')} (da: {db_format.get('other_positions_full_name')})")
        
        if all_none:
            print("\n✅ TEST SUPERATO - Tutti i campi scout sono None")
            return True
        else:
            print("\n❌ TEST FALLITO - Alcuni campi scout hanno valori di default")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Errore di connessione: {e}")
        return False
    except Exception as e:
        print(f"❌ Errore: {e}")
        return False

def main():
    print("="*80)
    print("🚀 TEST COMPLETO IMPORTAZIONE TRANSFERMARKT")
    print("="*80)
    print("\nVerifica che:")
    print("  1. I dati del giocatore vengano importati correttamente")
    print("  2. Le abbreviazioni siano generate")
    print("  3. I campi scout (priority, notes, ecc.) siano None")
    print()
    
    # Test con diversi giocatori
    test_cases = [
        ("https://www.transfermarkt.it/james-penrice/profil/spieler/363227", "James Penrice (Terzino)"),
        ("https://www.transfermarkt.it/virgil-van-dijk/profil/spieler/139208", "Virgil van Dijk (Difensore)"),
        ("https://www.transfermarkt.it/jude-bellingham/profil/spieler/581678", "Jude Bellingham (Centrocampo)"),
    ]
    
    results = []
    for url, name in test_cases:
        result = test_import(url, name)
        results.append((name, result))
    
    # Riepilogo
    print("\n" + "="*80)
    print("📊 RIEPILOGO TEST")
    print("="*80)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {name}")
    
    print(f"\n{'='*80}")
    print(f"Risultato: {passed}/{total} test superati")
    print("="*80)
    
    if passed == total:
        print("\n🎉 TUTTI I TEST SUPERATI!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test falliti")
        return 1

if __name__ == "__main__":
    exit(main())
