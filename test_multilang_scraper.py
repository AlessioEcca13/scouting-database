#!/usr/bin/env python3
"""
Test script per Transfermarkt Multilingual Scraper
Testa l'estrazione da diverse lingue e la traduzione in inglese
"""

from transfermarkt_multilang_scraper import MultiLangTransfermarktScraper
import json

def test_single_player_multilang():
    """Test dello stesso giocatore in diverse lingue"""
    scraper = MultiLangTransfermarktScraper()
    
    # James Penrice in diverse lingue
    test_urls = {
        'Italiano': 'https://www.transfermarkt.it/james-penrice/profil/spieler/363227',
        'Spagnolo': 'https://www.transfermarkt.es/james-penrice/profil/spieler/363227',
        'Tedesco': 'https://www.transfermarkt.de/james-penrice/profil/spieler/363227',
        'Inglese': 'https://www.transfermarkt.co.uk/james-penrice/profil/spieler/363227',
    }
    
    print("=" * 100)
    print("🌍 TEST: STESSO GIOCATORE IN DIVERSE LINGUE")
    print("=" * 100)
    print("\nObiettivo: Verificare che tutti i dati vengano tradotti in inglese\n")
    
    results = {}
    
    for lang, url in test_urls.items():
        print(f"\n{'='*100}")
        print(f"📍 Lingua: {lang}")
        print(f"🔗 URL: {url}")
        print(f"{'='*100}\n")
        
        data = scraper.get_player_info(url)
        
        if 'error' not in data:
            results[lang] = data
            
            print(f"✅ Estrazione completata!")
            print(f"\n📊 DATI ESTRATTI (tradotti in inglese):")
            print(f"   Nome: {data.get('name', 'N/A')}")
            print(f"   Posizione: {data.get('position', 'N/A')}")
            print(f"   Ruolo naturale: {data.get('natural_position', 'N/A')}")
            print(f"   Altri ruoli: {data.get('other_positions', 'N/A')}")
            print(f"   Nazionalità: {data.get('nationality_primary', 'N/A')}")
            print(f"   Piede: {data.get('preferred_foot', 'N/A')}")
            print(f"   Altezza: {data.get('height_cm', 'N/A')} cm")
            print(f"   Anno nascita: {data.get('birth_year', 'N/A')}")
            print(f"   Squadra: {data.get('team', 'N/A')}")
            print(f"   Valore: €{data.get('market_value', 'N/A'):,.0f}" if data.get('market_value') else "   Valore: N/A")
        else:
            print(f"❌ Errore: {data['error']}")
    
    # Confronto risultati
    print(f"\n\n{'='*100}")
    print("🔍 CONFRONTO RISULTATI")
    print(f"{'='*100}\n")
    
    if len(results) > 1:
        # Confronta campi chiave
        fields_to_compare = ['position', 'natural_position', 'other_positions', 'nationality_primary', 'preferred_foot']
        
        print("Verifica consistenza traduzioni:\n")
        for field in fields_to_compare:
            print(f"📌 {field.upper()}:")
            values = {lang: data.get(field, 'N/A') for lang, data in results.items()}
            for lang, value in values.items():
                print(f"   {lang:12s}: {value}")
            
            # Verifica se tutti i valori sono uguali
            unique_values = set(v for v in values.values() if v != 'N/A')
            if len(unique_values) <= 1:
                print(f"   ✅ Consistente!\n")
            else:
                print(f"   ⚠️  Valori diversi rilevati\n")
    
    return results


def test_different_players():
    """Test di giocatori diversi in diverse lingue"""
    scraper = MultiLangTransfermarktScraper()
    
    test_cases = [
        {
            'name': 'Lionel Messi',
            'url': 'https://www.transfermarkt.es/lionel-messi/profil/spieler/28003',
            'lang': 'Spagnolo'
        },
        {
            'name': 'Cristiano Ronaldo',
            'url': 'https://www.transfermarkt.pt/cristiano-ronaldo/profil/spieler/8198',
            'lang': 'Portoghese'
        },
        {
            'name': 'Kylian Mbappé',
            'url': 'https://www.transfermarkt.fr/kylian-mbappe/profil/spieler/342229',
            'lang': 'Francese'
        },
    ]
    
    print("\n\n" + "=" * 100)
    print("🌟 TEST: GIOCATORI FAMOSI IN DIVERSE LINGUE")
    print("=" * 100)
    
    for case in test_cases:
        print(f"\n{'='*100}")
        print(f"👤 Giocatore: {case['name']}")
        print(f"🌍 Lingua: {case['lang']}")
        print(f"🔗 URL: {case['url']}")
        print(f"{'='*100}\n")
        
        data = scraper.get_player_info(case['url'])
        
        if 'error' not in data:
            print(f"✅ Dati estratti e tradotti in inglese:")
            print(json.dumps({
                'name': data.get('name'),
                'position': data.get('position'),
                'natural_position': data.get('natural_position'),
                'nationality': data.get('nationality_primary'),
                'team': data.get('team'),
                'foot': data.get('preferred_foot'),
            }, indent=2, ensure_ascii=False))
        else:
            print(f"❌ Errore: {data['error']}")


def main():
    """Esegue tutti i test"""
    print("\n" + "🚀" * 50)
    print("TRANSFERMARKT MULTILINGUAL SCRAPER - TEST SUITE")
    print("🚀" * 50 + "\n")
    
    # Test 1: Stesso giocatore in diverse lingue
    test_single_player_multilang()
    
    # Test 2: Giocatori diversi in diverse lingue
    # Decommentare per testare (richiede più tempo)
    # test_different_players()
    
    print("\n\n" + "✅" * 50)
    print("TEST COMPLETATI!")
    print("✅" * 50 + "\n")


if __name__ == "__main__":
    main()
