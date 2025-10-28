#!/usr/bin/env python3
"""
Transfermarkt Multilingual Scraper with Auto-Translation
Scraper multilingua per Transfermarkt con traduzione automatica in inglese

Supporta:
- Italiano (.it)
- Inglese (.co.uk, .com)
- Spagnolo (.es)
- Tedesco (.de)
- Francese (.fr)
- Portoghese (.pt)

Tutti i dati vengono tradotti in inglese per consistenza nel database.

Requisiti:
    pip install requests beautifulsoup4 lxml deep-translator

Uso:
    python transfermarkt_multilang_scraper.py
    
    oppure:
    from transfermarkt_multilang_scraper import MultiLangTransfermarktScraper
    scraper = MultiLangTransfermarktScraper()
    data = scraper.get_player_info("https://www.transfermarkt.es/james-penrice/profil/spieler/363227")
"""

import re
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Dict, Optional, List
from urllib.parse import urlparse
from deep_translator import GoogleTranslator

class MultiLangTransfermarktScraper:
    """Scraper multilingua per Transfermarkt con traduzione automatica"""
    
    # Mappatura domini -> lingua
    DOMAIN_LANGUAGE_MAP = {
        'transfermarkt.it': 'it',
        'transfermarkt.es': 'es',
        'transfermarkt.de': 'de',
        'transfermarkt.co.uk': 'en',
        'transfermarkt.com': 'en',
        'transfermarkt.fr': 'fr',
        'transfermarkt.pt': 'pt',
        'transfermarkt.com.br': 'pt',
    }
    
    # Traduzioni manuali per ruoli comuni (più affidabili della traduzione automatica)
    POSITION_TRANSLATIONS = {
        # Italiano
        'Portiere': 'Goalkeeper',
        'Difensore centrale': 'Centre-Back',
        'Difensore centrale sinistro': 'Left Centre-Back',
        'Difensore centrale destro': 'Right Centre-Back',
        'Terzino sinistro': 'Left-Back',
        'Terzino destro': 'Right-Back',
        'Esterno sinistro': 'Left Wing-Back',
        'Esterno destro': 'Right Wing-Back',
        'Mediano': 'Defensive Midfield',
        'Centrocampista': 'Central Midfield',
        'Centrocampista sinistro': 'Left Midfield',
        'Centrocampista destro': 'Right Midfield',
        'Trequartista': 'Attacking Midfield',
        'Ala sinistra': 'Left Winger',
        'Ala destra': 'Right Winger',
        'Seconda punta': 'Second Striker',
        'Attaccante': 'Centre-Forward',
        'Punta': 'Centre-Forward',
        
        # Spagnolo
        'Portero': 'Goalkeeper',
        'Defensa central': 'Centre-Back',
        'Lateral izquierdo': 'Left-Back',
        'Lateral derecho': 'Right-Back',
        'Pivote': 'Defensive Midfield',
        'Mediocentro': 'Central Midfield',
        'Mediapunta': 'Attacking Midfield',
        'Extremo izquierdo': 'Left Winger',
        'Extremo derecho': 'Right Winger',
        'Delantero centro': 'Centre-Forward',
        
        # Tedesco
        'Torwart': 'Goalkeeper',
        'Innenverteidiger': 'Centre-Back',
        'Linker Verteidiger': 'Left-Back',
        'Rechter Verteidiger': 'Right-Back',
        'Defensives Mittelfeld': 'Defensive Midfield',
        'Zentrales Mittelfeld': 'Central Midfield',
        'Offensives Mittelfeld': 'Attacking Midfield',
        'Linksaußen': 'Left Winger',
        'Rechtsaußen': 'Right Winger',
        'Mittelstürmer': 'Centre-Forward',
        'Sturm': 'Centre-Forward',
        
        # Francese
        'Gardien de but': 'Goalkeeper',
        'Défenseur central': 'Centre-Back',
        'Arrière gauche': 'Left-Back',
        'Arrière droit': 'Right-Back',
        'Milieu défensif': 'Defensive Midfield',
        'Milieu central': 'Central Midfield',
        'Milieu offensif': 'Attacking Midfield',
        'Ailier gauche': 'Left Winger',
        'Ailier droit': 'Right Winger',
        'Avant-centre': 'Centre-Forward',
        
        # Portoghese
        'Goleiro': 'Goalkeeper',
        'Zagueiro': 'Centre-Back',
        'Lateral esquerdo': 'Left-Back',
        'Lateral direito': 'Right-Back',
        'Volante': 'Defensive Midfield',
        'Meia': 'Central Midfield',
        'Meia-atacante': 'Attacking Midfield',
        'Ponta esquerda': 'Left Winger',
        'Ponta direita': 'Right Winger',
        'Centroavante': 'Centre-Forward',
    }
    
    # Traduzioni per piede preferito
    FOOT_TRANSLATIONS = {
        'destro': 'right',
        'sinistro': 'left',
        'ambidestro': 'both',
        'derecho': 'right',
        'izquierdo': 'left',
        'ambidiestro': 'both',
        'rechts': 'right',
        'links': 'left',
        'beidfüßig': 'both',
        'droit': 'right',
        'gauche': 'left',
        'ambidextre': 'both',
        'direito': 'right',
        'esquerdo': 'left',
        'ambidestro': 'both',
    }
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Connection': 'keep-alive',
        })
        self.translator = None
        self.detected_language = None
    
    def detect_language_from_url(self, url: str) -> str:
        """Rileva la lingua dal dominio dell'URL"""
        parsed = urlparse(url)
        domain = parsed.netloc
        
        for domain_pattern, lang in self.DOMAIN_LANGUAGE_MAP.items():
            if domain_pattern in domain:
                return lang
        
        # Default: inglese
        return 'en'
    
    def translate_to_english(self, text: str, source_lang: str) -> str:
        """Traduce il testo in inglese"""
        if not text or source_lang == 'en':
            return text
        
        try:
            # Inizializza traduttore se necessario
            if not self.translator or self.translator.source != source_lang:
                self.translator = GoogleTranslator(source=source_lang, target='en')
            
            return self.translator.translate(text)
        except Exception as e:
            print(f"⚠️  Translation error '{text}': {e}")
            return text
    
    def translate_position(self, position: str, source_lang: str) -> str:
        """Traduce il ruolo usando dizionario manuale o traduttore"""
        if not position:
            return ""
        
        # Pulisci il testo
        position_clean = self.clean_text(position)
        
        # Rimuovi prefissi come "Difesa - ", "Centrocampo - ", etc.
        position_clean = re.sub(r'^(Difesa|Centrocampo|Attacco|Defense|Midfield|Attack|Defensa|Mediocampo|Ataque|Abwehr|Mittelfeld|Angriff|Défense|Milieu|Attaque|Defesa|Meio-campo|Ataque)\s*-\s*', '', position_clean, flags=re.IGNORECASE)
        
        # Cerca traduzione manuale
        if position_clean in self.POSITION_TRANSLATIONS:
            return self.POSITION_TRANSLATIONS[position_clean]
        
        # Altrimenti usa traduttore automatico
        if source_lang != 'en':
            return self.translate_to_english(position_clean, source_lang)
        
        return position_clean
    
    def translate_foot(self, foot: str, source_lang: str) -> str:
        """Traduce il piede preferito"""
        if not foot:
            return ""
        
        foot_lower = foot.lower().strip()
        
        # Cerca traduzione manuale
        if foot_lower in self.FOOT_TRANSLATIONS:
            return self.FOOT_TRANSLATIONS[foot_lower]
        
        # Altrimenti usa traduttore
        if source_lang != 'en':
            translated = self.translate_to_english(foot_lower, source_lang)
            return translated.lower()
        
        return foot_lower
    
    def extract_player_id(self, url: str) -> Optional[str]:
        """Estrae l'ID del giocatore dall'URL"""
        match = re.search(r'spieler/(\d+)', url)
        return match.group(1) if match else None
    
    def clean_text(self, text: str) -> str:
        """Pulisce il testo rimuovendo spazi extra e newline"""
        if not text:
            return ""
        return ' '.join(text.strip().split())
    
    def parse_market_value(self, value_str: str) -> Optional[float]:
        """Parsea il valore di mercato in euro"""
        if not value_str:
            return None
        
        try:
            # Rimuovi simboli di valuta e spazi
            value_str = value_str.replace('€', '').replace('£', '').replace('$', '').strip()
            
            # Gestisci abbreviazioni (mln, mil, m, k, etc.)
            multiplier = 1
            if re.search(r'(mln|mil|m)\b', value_str, re.IGNORECASE):
                multiplier = 1000000
                value_str = re.sub(r'(mln|mil|m)\b', '', value_str, flags=re.IGNORECASE)
            elif re.search(r'k\b', value_str, re.IGNORECASE):
                multiplier = 1000
                value_str = re.sub(r'k\b', '', value_str, flags=re.IGNORECASE)
            
            # Rimuovi separatori di migliaia e converti virgola in punto
            value_str = value_str.replace('.', '').replace(',', '.')
            
            # Estrai numero
            match = re.search(r'[\d.]+', value_str)
            if match:
                value = float(match.group(0)) * multiplier
                return value
            
            return None
        except Exception as e:
            print(f"⚠️  Value parsing error '{value_str}': {e}")
            return None
    
    def get_player_info(self, url: str) -> Dict:
        """
        Estrae tutte le informazioni del giocatore dall'URL Transfermarkt
        Traduce automaticamente tutto in inglese
        
        Args:
            url: URL del profilo Transfermarkt (qualsiasi lingua)
            
        Returns:
            Dizionario con tutti i dati in inglese
        """
        try:
            # Rileva lingua dall'URL
            self.detected_language = self.detect_language_from_url(url)
            print(f"🌍 Detected language: {self.detected_language.upper()}")
            
            # Estrai ID giocatore
            player_id = self.extract_player_id(url)
            if not player_id:
                return {"error": "Player ID not found in URL"}
            
            print(f"📥 Downloading data for player ID: {player_id}")
            
            # Scarica pagina
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Dati del giocatore
            player_data = {
                'player_id': player_id,
                'url': url,
                'source_language': self.detected_language
            }
            
            # Nome
            name_tag = soup.find('h1', class_='data-header__headline-wrapper')
            if name_tag:
                player_data['name'] = self.clean_text(name_tag.get_text())
            
            # Info box principale
            info_table = soup.find('div', class_='info-table')
            if info_table:
                # Trova tutte le coppie label-value
                labels = info_table.find_all('span', class_='info-table__content--regular')
                
                for label_tag in labels:
                    # Il valore è nel prossimo span con classe --bold
                    value_tag = label_tag.find_next_sibling('span', class_='info-table__content--bold')
                    if not value_tag:
                        continue
                    
                    label = self.clean_text(label_tag.get_text()).lower()
                    value = self.clean_text(value_tag.get_text())
                    
                    # Data di nascita / età
                    if any(keyword in label for keyword in ['birth', 'nascita', 'nacim', 'nacimiento', 'geburt', 'naissance', 'nascimento', 'edad', 'age', 'età']):
                        # Estrai anno
                        year_match = re.search(r'\b(19|20)\d{2}\b', value)
                        if year_match:
                            player_data['birth_year'] = int(year_match.group(0))
                        
                        # Estrai età
                        age_match = re.search(r'\((\d+)\)', value)
                        if age_match:
                            player_data['age'] = int(age_match.group(1))
                    
                    # Altezza
                    elif any(keyword in label for keyword in ['height', 'altezza', 'altura', 'größe', 'taille', 'height']):
                        # Supporta formati: "1,77 m", "1.77 m", "177 cm"
                        height_match = re.search(r'(\d+)[,.](\d+)\s*m', value)
                        if height_match:
                            meters = float(f"{height_match.group(1)}.{height_match.group(2)}")
                            player_data['height_cm'] = int(meters * 100)
                        else:
                            # Prova formato cm
                            cm_match = re.search(r'(\d+)\s*cm', value)
                            if cm_match:
                                player_data['height_cm'] = int(cm_match.group(1))
                    
                    # Nazionalità (cerca anche "lugar de nac" per nazionalità)
                    elif any(keyword in label for keyword in ['citizenship', 'nazionalità', 'nacionalidad', 'nationalität', 'nationalité', 'nacionalidade', 'lugar', 'place']):
                        # Estrai nome paese (ignora città)
                        # Cerca img con alt che contiene il nome del paese
                        img_tag = value_tag.find('img', alt=True)
                        if img_tag and img_tag.get('alt'):
                            nationality = img_tag['alt']
                            if self.detected_language != 'en':
                                player_data['nationality_primary'] = self.translate_to_english(nationality, self.detected_language)
                            else:
                                player_data['nationality_primary'] = nationality
                        elif value and not any(x in value.lower() for x in ['unknown', 'n/a', '-']):
                            # Fallback: usa il testo
                            if self.detected_language != 'en':
                                player_data['nationality_primary'] = self.translate_to_english(value, self.detected_language)
                            else:
                                player_data['nationality_primary'] = value
                    
                    # Posizione
                    elif any(keyword in label for keyword in ['position', 'posizione', 'posición', 'position', 'posição']):
                        player_data['position'] = self.translate_position(value, self.detected_language)
                    
                    # Piede preferito
                    elif any(keyword in label for keyword in ['foot', 'piede', 'pie', 'fuß', 'pied', 'pé']):
                        player_data['preferred_foot'] = self.translate_foot(value, self.detected_language)
                    
                    # Valore di mercato
                    elif any(keyword in label for keyword in ['market value', 'valore', 'valor', 'marktwert', 'valeur']):
                        player_data['market_value'] = self.parse_market_value(value)
                    
                    # Scadenza contratto
                    elif any(keyword in label for keyword in ['contract', 'contratto', 'contrato', 'vertrag']):
                        date_match = re.search(r'\b(19|20)\d{2}\b', value)
                        if date_match:
                            player_data['contract_expiry'] = date_match.group(0)
            
            # Squadra attuale
            current_club = soup.find('span', class_='data-header__club')
            if current_club:
                club_name = current_club.get_text().strip()
                # Traduce nome squadra se necessario
                if self.detected_language != 'en':
                    player_data['team'] = self.translate_to_english(club_name, self.detected_language)
                else:
                    player_data['team'] = club_name
            
            # Immagine profilo
            img_tag = soup.find('img', class_='data-header__profile-image')
            if img_tag and img_tag.get('src'):
                player_data['profile_image'] = img_tag['src']
            
            # Ruolo naturale e altri ruoli
            role_section = soup.find('div', class_='detail-position')
            if role_section:
                # Ruolo naturale
                natural_role = role_section.find('dt', string=re.compile(r'Main position|Ruolo naturale|Posición principal|Hauptposition|Position principale|Posição principal', re.IGNORECASE))
                if natural_role:
                    natural_role_value = natural_role.find_next_sibling('dd')
                    if natural_role_value:
                        player_data['natural_position'] = self.translate_position(
                            self.clean_text(natural_role_value.get_text()),
                            self.detected_language
                        )
                
                # Altri ruoli
                other_roles = role_section.find('dt', string=re.compile(r'Other position|Altro ruolo|Otra posición|Weitere Position|Autre position|Outra posição', re.IGNORECASE))
                if other_roles:
                    other_roles_value = other_roles.find_next_sibling('dd')
                    if other_roles_value:
                        player_data['other_positions'] = self.translate_position(
                            self.clean_text(other_roles_value.get_text()),
                            self.detected_language
                        )
            
            print(f"✅ Data extracted successfully for {player_data.get('name', 'Unknown')}")
            print(f"   Fields extracted: {', '.join(player_data.keys())}")
            
            return player_data
            
        except requests.RequestException as e:
            print(f"❌ Network error: {e}")
            return {"error": f"Network error: {str(e)}"}
        except Exception as e:
            print(f"❌ Extraction error: {e}")
            import traceback
            traceback.print_exc()
            return {"error": f"Extraction error: {str(e)}"}


def main():
    """Test dello scraper con URL multilingua"""
    scraper = MultiLangTransfermarktScraper()
    
    # Test URLs in diverse lingue
    test_urls = [
        "https://www.transfermarkt.it/james-penrice/profil/spieler/363227",  # Italiano
        "https://www.transfermarkt.es/james-penrice/profil/spieler/363227",  # Spagnolo
        "https://www.transfermarkt.de/james-penrice/profil/spieler/363227",  # Tedesco
        "https://www.transfermarkt.co.uk/james-penrice/profil/spieler/363227",  # Inglese
    ]
    
    print("=" * 80)
    print("🌍 TRANSFERMARKT MULTILINGUAL SCRAPER TEST")
    print("=" * 80)
    
    for url in test_urls:
        print(f"\n{'='*80}")
        print(f"Testing URL: {url}")
        print(f"{'='*80}")
        
        data = scraper.get_player_info(url)
        
        if 'error' not in data:
            print(f"\n📊 EXTRACTED DATA (English):")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"\n❌ Error: {data['error']}")
        
        print("\n" + "="*80)


if __name__ == "__main__":
    main()
