#!/bin/bash

echo "======================================"
echo "🧪 TEST TRANSFERMARKT SCRAPER API"
echo "======================================"
echo ""

# Test 1: Health Check
echo "1️⃣  Test Health Check..."
response=$(curl -s http://localhost:5001/health)
if echo "$response" | grep -q "ok"; then
    echo "✅ Health check OK"
else
    echo "❌ Health check FAILED"
    exit 1
fi
echo ""

# Test 2: Scrape Player
echo "2️⃣  Test Scraping Giocatore..."
echo "   URL: https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497"
response=$(curl -s -X POST http://localhost:5001/api/scrape \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497"}')

if echo "$response" | grep -q '"success": true'; then
    echo "✅ Scraping completato con successo"
    
    # Estrai nome giocatore
    name=$(echo "$response" | grep -o '"name": "[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Nome estratto: $name"
    
    # Estrai nazionalità
    nationality=$(echo "$response" | grep -o '"nationality_primary": "[^"]*"' | cut -d'"' -f4)
    echo "   Nazionalità: $nationality"
    
    # Estrai posizione
    position=$(echo "$response" | grep -o '"position": "[^"]*"' | cut -d'"' -f4)
    echo "   Posizione: $position"
else
    echo "❌ Scraping FAILED"
    echo "$response"
    exit 1
fi
echo ""

echo "======================================"
echo "✅ TUTTI I TEST PASSATI!"
echo "======================================"
echo ""
echo "🚀 L'API è pronta per essere usata nel frontend React"
echo ""
