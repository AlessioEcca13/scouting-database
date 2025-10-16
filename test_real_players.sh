#!/bin/bash
# Test con giocatori reali da Transfermarkt

echo "=========================================="
echo "🧪 TEST CON GIOCATORI REALI"
echo "=========================================="
echo ""

# Array di URL di test (uno per ogni ruolo)
declare -a urls=(
    "https://www.transfermarkt.it/gianluigi-donnarumma/profil/spieler/315858"  # Portiere
    "https://www.transfermarkt.it/virgil-van-dijk/profil/spieler/139208"      # Difensore
    "https://www.transfermarkt.it/james-penrice/profil/spieler/363227"        # Terzino
    "https://www.transfermarkt.it/jude-bellingham/profil/spieler/581678"      # Centrocampo
    "https://www.transfermarkt.it/vinicius-junior/profil/spieler/371998"      # Ala
    "https://www.transfermarkt.it/erling-haaland/profil/spieler/418560"       # Attaccante
)

for url in "${urls[@]}"; do
    echo "Testing: $url"
    curl -s -X POST http://localhost:5001/api/scrape \
        -H "Content-Type: application/json" \
        -d "{\"url\": \"$url\"}" | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        db = data['db_format']
        print(f\"✅ {db['name']:25s} | Ruolo: {db['general_role']:12s} | Pos: {db['specific_position']:5s} | Full: {db['position_full_name']}\")
    else:
        print(f\"❌ Errore: {data.get('error', 'Unknown')}\")
except Exception as e:
    print(f\"❌ Errore parsing: {e}\")
"
    echo ""
done

echo "=========================================="
echo "✅ TEST COMPLETATO"
echo "=========================================="
