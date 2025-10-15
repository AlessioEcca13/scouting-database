#!/usr/bin/env python3
"""
API Flask per Transfermarkt Scraper
Espone endpoint REST per estrarre dati giocatori da Transfermarkt
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from transfermarkt_scraper import TransfermarktScraper, map_to_database_format
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inizializza Flask
app = Flask(__name__)
CORS(app)  # Abilita CORS per permettere richieste dal frontend React

# Inizializza scraper
scraper = TransfermarktScraper()


@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint per verificare che l'API sia attiva"""
    return jsonify({
        'status': 'ok',
        'message': 'Transfermarkt Scraper API is running'
    })


@app.route('/api/scrape', methods=['POST'])
def scrape_player():
    """
    Endpoint principale per estrarre dati giocatore da Transfermarkt
    
    Body JSON:
    {
        "url": "https://www.transfermarkt.it/player-name/profil/spieler/123456"
    }
    
    Returns:
    {
        "success": true,
        "data": {...},
        "db_format": {...}
    }
    """
    try:
        # Ottieni URL dal body della richiesta
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'URL mancante. Fornire {"url": "..."}'
            }), 400
        
        url = data['url']
        
        # Valida URL
        if 'transfermarkt' not in url.lower():
            return jsonify({
                'success': False,
                'error': 'URL non valido. Deve essere un link Transfermarkt'
            }), 400
        
        logger.info(f"Richiesta scraping per URL: {url}")
        
        # Esegui scraping
        player_data = scraper.get_player_info(url)
        
        # Verifica errori
        if 'error' in player_data:
            return jsonify({
                'success': False,
                'error': player_data['error']
            }), 500
        
        # Mappa al formato database
        db_format = map_to_database_format(player_data)
        
        logger.info(f"Scraping completato per: {player_data.get('name', 'Unknown')}")
        
        return jsonify({
            'success': True,
            'data': player_data,
            'db_format': db_format
        })
        
    except Exception as e:
        logger.error(f"Errore durante scraping: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Errore server: {str(e)}'
        }), 500


@app.route('/api/scrape-url', methods=['GET'])
def scrape_player_get():
    """
    Endpoint GET alternativo per estrarre dati giocatore
    
    Query params:
    ?url=https://www.transfermarkt.it/...
    """
    try:
        url = request.args.get('url')
        
        if not url:
            return jsonify({
                'success': False,
                'error': 'Parametro URL mancante'
            }), 400
        
        if 'transfermarkt' not in url.lower():
            return jsonify({
                'success': False,
                'error': 'URL non valido. Deve essere un link Transfermarkt'
            }), 400
        
        logger.info(f"Richiesta scraping GET per URL: {url}")
        
        # Esegui scraping
        player_data = scraper.get_player_info(url)
        
        if 'error' in player_data:
            return jsonify({
                'success': False,
                'error': player_data['error']
            }), 500
        
        # Mappa al formato database
        db_format = map_to_database_format(player_data)
        
        return jsonify({
            'success': True,
            'data': player_data,
            'db_format': db_format
        })
        
    except Exception as e:
        logger.error(f"Errore durante scraping: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Errore server: {str(e)}'
        }), 500


if __name__ == '__main__':
    print("=" * 70)
    print("🚀 TRANSFERMARKT SCRAPER API")
    print("=" * 70)
    print()
    print("API in esecuzione su: http://localhost:5001")
    print()
    print("Endpoints disponibili:")
    print("  GET  /health              - Health check")
    print("  POST /api/scrape          - Scrape player (JSON body)")
    print("  GET  /api/scrape-url      - Scrape player (query param)")
    print()
    print("Esempio richiesta POST:")
    print('  curl -X POST http://localhost:5001/api/scrape \\')
    print('       -H "Content-Type: application/json" \\')
    print('       -d \'{"url": "https://www.transfermarkt.it/player/profil/spieler/123"}\'')
    print()
    print("Esempio richiesta GET:")
    print('  curl "http://localhost:5001/api/scrape-url?url=https://www.transfermarkt.it/..."')
    print()
    print("=" * 70)
    print()
    
    # Avvia server Flask
    app.run(debug=True, host='0.0.0.0', port=5001)
