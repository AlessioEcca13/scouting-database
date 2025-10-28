#!/usr/bin/env python3
"""
Transfermarkt Scraper API Server
API REST per lo scraper multilingua Transfermarkt

Endpoint:
    POST /api/scrape - Estrae dati da URL Transfermarkt

Uso:
    python3 scraper_api.py
    
    Poi da React:
    fetch('http://localhost:5001/api/scrape', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url: 'https://www.transfermarkt.es/...'})
    })
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from transfermarkt_multilang_scraper import MultiLangTransfermarktScraper
from integrate_multilang_to_db import (
    extract_and_map_to_database,
    map_position_to_abbreviation,
    map_position_to_general_role
)
import traceback

app = Flask(__name__)
CORS(app)  # Abilita CORS per React

# Inizializza scraper globale
scraper = MultiLangTransfermarktScraper()


@app.route('/api/scrape', methods=['POST', 'OPTIONS'])
def scrape_player():
    """
    Endpoint per estrarre dati da Transfermarkt
    
    Request Body:
        {
            "url": "https://www.transfermarkt.es/player/profil/spieler/123"
        }
    
    Response:
        {
            "success": true,
            "data": {
                "name": "Player Name",
                "position": "Left-Back",
                ...
            }
        }
    """
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Ottieni URL dal body
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'URL missing in request body'
            }), 400
        
        url = data['url']
        
        # Rimuovi parametri extra come /fromCaptcha/1
        if '/fromCaptcha' in url or '/fromCatpcha' in url:
            url = url.split('/fromC')[0]
        
        print(f"\n{'='*80}")
        print(f"📥 Richiesta scraping da: {url}")
        print(f"{'='*80}\n")
        
        # Estrai e mappa dati
        db_data = extract_and_map_to_database(url)
        
        if not db_data:
            return jsonify({
                'success': False,
                'error': 'Unable to extract data from provided URL'
            }), 400
        
        print(f"\n✅ Data extracted successfully!")
        print(f"   Name: {db_data.get('name')}")
        print(f"   Position: {db_data.get('specific_position')}\n")
        
        # Restituisci dati
        return jsonify({
            'success': True,
            'data': db_data,
            'message': f"Data successfully extracted for {db_data.get('name')}"
        }), 200
        
    except Exception as e:
        print(f"\n❌ ERRORE durante lo scraping:")
        print(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': str(e),
            'details': traceback.format_exc()
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Transfermarkt Scraper API is running',
        'version': '1.0.0'
    }), 200


@app.route('/api/supported-languages', methods=['GET'])
def supported_languages():
    """Restituisce le lingue supportate"""
    return jsonify({
        'languages': [
            {'code': 'it', 'name': 'Italiano', 'domain': 'transfermarkt.it'},
            {'code': 'es', 'name': 'Spagnolo', 'domain': 'transfermarkt.es'},
            {'code': 'de', 'name': 'Tedesco', 'domain': 'transfermarkt.de'},
            {'code': 'en', 'name': 'Inglese', 'domain': 'transfermarkt.co.uk'},
            {'code': 'fr', 'name': 'Francese', 'domain': 'transfermarkt.fr'},
            {'code': 'pt', 'name': 'Portoghese', 'domain': 'transfermarkt.pt'},
        ]
    }), 200


if __name__ == '__main__':
    print("\n" + "🚀" * 40)
    print("TRANSFERMARKT SCRAPER API SERVER")
    print("🚀" * 40 + "\n")
    print("📍 Server running on: http://localhost:5001")
    print("📡 Endpoint: POST http://localhost:5001/api/scrape")
    print("🏥 Health check: GET http://localhost:5001/api/health")
    print("\n" + "="*80 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
