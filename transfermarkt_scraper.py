#!/usr/bin/env python3
"""
Transfermarkt Player Scraper
Script Python per estrarre informazioni dettagliate sui giocatori da Transfermarkt

Requisiti:
    pip install requests beautifulsoup4 lxml

Uso:
    python transfermarkt_scraper.py
    
    oppure importalo:
    from transfermarkt_scraper import get_player_info
    data = get_player_info("https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497")
"""

import re
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Dict, Optional
from urllib.parse import urlparse


class TransfermarktScraper:
    """Scraper per estrarre dati da Transfermarkt"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Connection': 'keep-alive',
        })
    
    def extract_player_id(self, url: str) -> Optional[str]:
        """Estrae l'ID del giocatore dall'URL"""
        match = re.search(r'spieler/(\d+)', url)
        return match.group(1) if match else None
    
    def clean_text(self, text: str) -> str:
        """Pulisce il testo rimuovendo spazi extra e newline"""
        if not text:
            return ""
        return ' '.join(text.strip().split())
    
    def parse_date(self, date_str: str) -> Optional[Dict[str, int]]:
        """Parsea una data e restituisce giorno, mese, anno"""
        try:
            # Formati comuni: "17 gen 2000", "Jan 17, 2000", etc.
            # Rimuovi testo extra come "(24)"
            date_str = re.sub(r'\([^)]*\)', '', date_str).strip()
            
            # Prova diversi formati
            formats = [
                '%d %b %Y',  # 17 gen 2000
                '%b %d, %Y',  # Jan 17, 2000
                '%d/%m/%Y',   # 17/01/2000
                '%Y-%m-%d',   # 2000-01-17
            ]
            
            for fmt in formats:
                try:
                    date_obj = datetime.strptime(date_str, fmt)
                    return {
                        'day': date_obj.day,
                        'month': date_obj.month,
                        'year': date_obj.year
                    }
                except ValueError:
                    continue
            
            # Se nessun formato funziona, prova ad estrarre almeno l'anno
            year_match = re.search(r'\b(19|20)\d{2}\b', date_str)
            if year_match:
                return {'year': int(year_match.group(0))}
            
            return None
        except Exception as e:
            print(f"Errore parsing data '{date_str}': {e}")
            return None
    
    def get_player_info(self, url: str) -> Dict:
        """
        Estrae tutte le informazioni del giocatore dall'URL Transfermarkt
        
        Args:
            url: URL del profilo Transfermarkt del giocatore
            
        Returns:
            Dizionario con tutti i dati del giocatore
        """
        try:
            # Estrai ID giocatore
            player_id = self.extract_player_id(url)
            if not player_id:
                return {"error": "ID giocatore non trovato nell'URL"}
            
            print(f"📥 Scaricamento dati per giocatore ID: {player_id}")
            
            # Richiesta HTTP
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Dizionario dati giocatore
            player_data = {
                'id': player_id,
                'url': url,
                'scraped_at': datetime.now().isoformat()
            }
            
            # ========================================
            # IMMAGINE PROFILO
            # ========================================
            profile_img = soup.find('img', class_='data-header__profile-image')
            if profile_img:
                img_url = profile_img.get('src', '')
                if img_url:
                    # Se l'URL è relativo, rendilo assoluto
                    if img_url.startswith('//'):
                        img_url = 'https:' + img_url
                    elif img_url.startswith('/'):
                        img_url = 'https://www.transfermarkt.it' + img_url
                    player_data['profile_image'] = img_url
            
            # ========================================
            # NOME GIOCATORE
            # ========================================
            name_tag = soup.find('h1', class_='data-header__headline-wrapper')
            if name_tag:
                full_name = self.clean_text(name_tag.get_text())
                # Rimuovi il numero di maglia se presente
                name_clean = re.sub(r'^#\d+\s+', '', full_name)
                player_data['name'] = name_clean
                player_data['name_with_number'] = full_name
            
            # ========================================
            # INFORMAZIONI PRINCIPALI - APPROCCIO MULTI-METODO
            # ========================================
            
            # METODO 1: Cerca info-table (struttura classica)
            info_table = soup.find('div', class_='info-table')
            if info_table:
                # Trova tutte le righe (span con classe info-table__content)
                all_spans = info_table.find_all('span', class_='info-table__content')
                
                for i, span in enumerate(all_spans):
                    text = self.clean_text(span.get_text()).lower()
                    
                    # Se questo span contiene una label, il prossimo contiene il valore
                    if any(keyword in text for keyword in ['data di nascita', 'date of birth', 'nato il', 'geboren', 'luogo', 'place', 
                                                             'altezza', 'height', 'nazionalità', 'citizenship',
                                                             'posizione', 'position', 'piede', 'foot']):
                        # Il valore è nel prossimo span
                        if i + 1 < len(all_spans):
                            value_span = all_spans[i + 1]
                            value = self.clean_text(value_span.get_text())
                            
                            # Data di nascita
                            if 'data di nascita' in text or 'date of birth' in text or 'nato il' in text or 'geboren' in text:
                                player_data['date_of_birth_text'] = value
                                # Estrai età se presente
                                age_match = re.search(r'\((\d+)\)', value)
                                if age_match:
                                    player_data['age'] = int(age_match.group(1))
                                    # Calcola anno di nascita dall'età
                                    current_year = datetime.now().year
                                    player_data['birth_year'] = current_year - int(age_match.group(1))
                                    print(f"   📅 Anno calcolato da età: {player_data['birth_year']}")
                                
                                # Cerca anche anno esplicito (1900-2029)
                                year_match = re.search(r'\b(19\d{2}|20[0-2]\d)\b', value)
                                if year_match:
                                    player_data['birth_year'] = int(year_match.group(1))
                                    print(f"   📅 Anno estratto direttamente: {player_data['birth_year']}")
                            
                            # Luogo di nascita
                            elif 'luogo' in text or 'place' in text:
                                player_data['birth_place'] = value
                            
                            # Altezza
                            elif 'altezza' in text or 'height' in text:
                                player_data['height_raw'] = value
                                height_match = re.search(r'(\d+),(\d+)', value)
                                if height_match:
                                    height_m = float(f"{height_match.group(1)}.{height_match.group(2)}")
                                    player_data['height_cm'] = int(height_m * 100)
                            
                            # Peso
                            elif 'peso' in text or 'weight' in text:
                                player_data['weight_raw'] = value
                                weight_match = re.search(r'(\d+)', value)
                                if weight_match:
                                    player_data['weight_kg'] = int(weight_match.group(1))
                            
                            # Nazionalità
                            elif 'nazionalità' in text or 'citizenship' in text:
                                flags = value_span.find_all('img', class_='flaggenrahmen')
                                if flags:
                                    nationalities = []
                                    for flag in flags:
                                        nat = flag.get('title', '') or flag.get('alt', '')
                                        if nat and nat not in nationalities:
                                            nationalities.append(nat)
                                    if nationalities:
                                        player_data['nationality'] = nationalities
                                        player_data['nationality_primary'] = nationalities[0]
                            
                            # Posizione
                            elif 'posizione' in text or 'position' in text:
                                player_data['position'] = value
                            
                            # Piede
                            elif 'piede' in text or 'foot' in text:
                                player_data['preferred_foot'] = value
            
            # Fallback per posizione se non trovata sopra
            if 'position' not in player_data:
                position_tags = soup.find_all('dd')
                for tag in position_tags:
                    text = self.clean_text(tag.get_text())
                    if any(pos in text for pos in ['Goalkeeper', 'Defender', 'Midfield', 'Forward', 
                                                    'Winger', 'Striker', 'Centre', 'Back', 'Difesa', 'Centrocampo', 'Attacco']):
                        player_data['position'] = text
                        break
            
            # ========================================
            # RUOLO DETTAGLIATO (con grafico campo e coordinate)
            # ========================================
            # Cerca la sezione "Ruolo" con ruolo naturale e altri ruoli
            role_section = soup.find('div', class_='detail-position')
            if role_section:
                # Ruolo naturale
                natural_role = role_section.find('dt', string=re.compile(r'Ruolo naturale|Main position', re.IGNORECASE))
                if natural_role:
                    natural_role_value = natural_role.find_next_sibling('dd')
                    if natural_role_value:
                        player_data['natural_position'] = self.clean_text(natural_role_value.get_text())
                
                # Altri ruoli
                other_roles = role_section.find('dt', string=re.compile(r'Altro ruolo|Other position', re.IGNORECASE))
                if other_roles:
                    other_roles_value = other_roles.find_next_sibling('dd')
                    if other_roles_value:
                        # Può esserci più di un ruolo alternativo
                        roles_list = [self.clean_text(r.get_text()) for r in other_roles_value.find_all('dd')] if other_roles_value.find_all('dd') else [self.clean_text(other_roles_value.get_text())]
                        player_data['other_positions'] = roles_list if len(roles_list) > 1 else roles_list[0] if roles_list else None
                
                # ESTRAI COORDINATE PALLINI DAL GRAFICO SVG
                svg_field = role_section.find('svg')
                if svg_field:
                    positions = []
                    # Cerca tutti i cerchi (pallini) nel campo
                    circles = svg_field.find_all('circle', class_=re.compile(r'position'))
                    for circle in circles:
                        try:
                            cx = float(circle.get('cx', 0))
                            cy = float(circle.get('cy', 0))
                            # Normalizza coordinate (SVG è tipicamente 0-100)
                            positions.append({'x': cx, 'y': cy})
                        except:
                            pass
                    
                    if positions:
                        # Prendi la posizione principale (primo pallino più grande)
                        main_position = positions[0] if positions else None
                        if main_position:
                            player_data['field_position_x'] = main_position['x']
                            player_data['field_position_y'] = main_position['y']
            
            # ========================================
            # SQUADRA ATTUALE
            # ========================================
            club_header = soup.find('span', class_='data-header__club')
            if club_header:
                club_link = club_header.find('a')
                if club_link:
                    player_data['current_club'] = self.clean_text(club_link.get_text())
                    player_data['current_club_url'] = club_link.get('href', '')
            
            # ========================================
            # VALORE DI MERCATO
            # ========================================
            market_value = soup.find('div', class_='tm-player-market-value-development__current-value')
            if market_value:
                full_value = self.clean_text(market_value.get_text())
                player_data['market_value_raw'] = full_value
                
                # Estrai valore numerico (es: "3,50 mln €")
                value_match = re.search(r'(\d+[,.]?\d*)\s*(mln|mil|mila|k)?', full_value, re.IGNORECASE)
                if value_match:
                    num = float(value_match.group(1).replace(',', '.'))
                    unit = value_match.group(2).lower() if value_match.group(2) else ''
                    
                    # Converti in milioni
                    if 'mln' in unit or 'mil' in unit:
                        player_data['market_value'] = num
                    elif 'mila' in unit or 'k' in unit:
                        player_data['market_value'] = num / 1000
                    else:
                        player_data['market_value'] = num
                
                # Estrai data aggiornamento - pattern più flessibile
                date_match = re.search(r'(\d{2}/\d{2}/\d{4})', full_value)
                if date_match:
                    player_data['market_value_updated'] = date_match.group(1)
            else:
                # Prova metodo alternativo
                value_tag = soup.find('a', class_='data-header__market-value-wrapper')
                if value_tag:
                    full_value = self.clean_text(value_tag.get_text())
                    player_data['market_value_raw'] = full_value
                    
                    value_match = re.search(r'(\d+[,.]?\d*)\s*(mln|mil|mila|k)?', full_value, re.IGNORECASE)
                    if value_match:
                        num = float(value_match.group(1).replace(',', '.'))
                        unit = value_match.group(2).lower() if value_match.group(2) else ''
                        
                        if 'mln' in unit or 'mil' in unit:
                            player_data['market_value'] = num
                        elif 'mila' in unit or 'k' in unit:
                            player_data['market_value'] = num / 1000
                        else:
                            player_data['market_value'] = num
                    
                    # Estrai data aggiornamento
                    date_match = re.search(r'(\d{2}/\d{2}/\d{4})', full_value)
                    if date_match:
                        player_data['market_value_updated'] = date_match.group(1)
            
            # ========================================
            # NUMERO MAGLIA
            # ========================================
            shirt_number = soup.find('span', class_='data-header__shirt-number')
            if shirt_number:
                number_text = self.clean_text(shirt_number.get_text())
                number_match = re.search(r'#(\d+)', number_text)
                if number_match:
                    player_data['shirt_number'] = int(number_match.group(1))
            
            # ========================================
            # CONTRATTO - Cerca nella info-table
            # ========================================
            # Cerca nella struttura info-table
            info_table = soup.find('div', class_='info-table')
            if info_table:
                all_spans = info_table.find_all('span', class_='info-table__content')
                for i, span in enumerate(all_spans):
                    text = self.clean_text(span.get_text()).lower()
                    if 'scadenza' in text or 'contratto' in text or 'contract' in text or 'expires' in text:
                        if i + 1 < len(all_spans):
                            value_span = all_spans[i + 1]
                            contract_text = self.clean_text(value_span.get_text())
                            player_data['contract_expiry'] = contract_text
                            break
            
            # ========================================
            # AGENTE
            # ========================================
            agent_label = soup.find('span', string=re.compile(r'Agente|Agent', re.IGNORECASE))
            if agent_label:
                agent_parent = agent_label.find_parent()
                if agent_parent:
                    agent_value = agent_parent.find('span', class_='info-table__content--bold')
                    if agent_value:
                        player_data['agent'] = self.clean_text(agent_value.get_text())
            
            # ========================================
            # STATISTICHE CARRIERA
            # ========================================
            # Cerca tabella statistiche
            stats_table = soup.find('div', class_='grid-view')
            if stats_table:
                player_data['career_stats'] = self._extract_career_stats(stats_table)
            
            # Debug: mostra quali dati sono stati estratti
            extracted_fields = [k for k in ['name', 'birth_year', 'age', 'height_cm', 'weight_kg', 'nationality_primary', 'position', 'preferred_foot', 'market_value', 'contract_expiry', 'profile_image', 'natural_position'] if k in player_data]
            print(f"✅ Dati estratti con successo per {player_data.get('name', 'Giocatore')}")
            print(f"   Campi estratti: {', '.join(extracted_fields)}" if extracted_fields else "   ⚠️  Pochi dati estratti - verificare struttura HTML")
            
            return player_data
            
        except requests.RequestException as e:
            return {"error": f"Errore connessione: {str(e)}"}
        except Exception as e:
            return {"error": f"Errore inaspettato: {str(e)}"}
    
    def _extract_career_stats(self, stats_table) -> Dict:
        """Estrae statistiche di carriera dalla tabella"""
        stats = {}
        try:
            # Cerca righe con statistiche totali
            rows = stats_table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 3:
                    label = self.clean_text(cells[0].get_text())
                    if 'Totale' in label or 'Total' in label:
                        # Estrai presenze e gol
                        if len(cells) >= 4:
                            stats['total_appearances'] = self.clean_text(cells[1].get_text())
                            stats['total_goals'] = self.clean_text(cells[2].get_text())
                            if len(cells) >= 5:
                                stats['total_assists'] = self.clean_text(cells[3].get_text())
        except Exception as e:
            print(f"Errore estrazione statistiche: {e}")
        
        return stats
    
    def save_to_json(self, data: Dict, filename: str = None):
        """Salva i dati in un file JSON"""
        if filename is None:
            player_name = data.get('name', 'player').replace(' ', '_').lower()
            filename = f"transfermarkt_{player_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Dati salvati in: {filename}")
        return filename


# ========================================
# FUNZIONI DI UTILITÀ
# ========================================

def get_player_info(url: str) -> Dict:
    """
    Funzione helper per estrarre rapidamente info giocatore
    
    Args:
        url: URL profilo Transfermarkt
        
    Returns:
        Dizionario con dati giocatore
    """
    scraper = TransfermarktScraper()
    return scraper.get_player_info(url)


def map_position_to_role(position: str) -> str:
    """
    Mappa la posizione Transfermarkt al ruolo generale (SEMPRE IN INGLESE)
    
    Ruoli generali disponibili:
    - Goalkeeper
    - Defender
    - Terzino (Full-back)
    - Centrocampo (Midfielder)
    - Ala (Winger)
    - Forward
    """
    if not position:
        return 'Centrocampo'
    
    pos_lower = position.lower()
    
    # Portieri -> Goalkeeper
    if any(x in pos_lower for x in ['portiere', 'goalkeeper', 'porta', 'torwart', 'gardien', 'portero']):
        return 'Goalkeeper'
    
    # Terzini (esterni inclusi) - PRIMA dei difensori centrali per evitare conflitti con "back"
    if any(x in pos_lower for x in ['terzino', 'left-back', 'right-back', 'esterno', 'wing-back', 'wingback', 'außenverteidiger', 'latéral', 'lateral']):
        return 'Terzino'
    
    # Difensori centrali - DOPO i terzini -> Defender
    if any(x in pos_lower for x in ['difensore', 'difesa', 'centre-back', 'center-back', 'defender', 'innenverteidiger', 'défenseur', 'defensa']):
        return 'Defender'
    
    # Centrocampo - PRIMA di Ali e Attaccanti per catturare mezzala, trequartista, ecc.
    if any(x in pos_lower for x in ['centrocampo', 'centrocampista', 'mediano', 'mezzala', 'trequartista', 'midfield', 'mittelfeld', 'milieu', 'mediocampista']):
        return 'Centrocampo'
    
    # Ali - PRIMA degli attaccanti per evitare conflitti -> Ala
    if any(x in pos_lower for x in ['ala', 'winger', 'flügel', 'ailier', 'extremo']):
        return 'Ala'
    
    # Attaccanti (punte e seconde punte) -> Forward
    if any(x in pos_lower for x in ['attaccante', 'attacco', 'punta', 'striker', 'forward', 'seconda punta', 'second striker', 'stürmer', 'avant', 'delantero']):
        return 'Forward'
    
    # Fallback: Centrocampo
    return 'Centrocampo'


def map_foot(foot: str) -> str:
    """Mappa il piede preferito al formato database (SEMPRE IN INGLESE)"""
    if not foot:
        return 'Right'
    
    foot_lower = foot.lower().strip()
    
    # Mapping multilingua -> Inglese
    foot_mapping = {
        # Inglese
        'right': 'Right',
        'left': 'Left',
        'both': 'Both',
        # Italiano
        'destro': 'Right',
        'sinistro': 'Left',
        'entrambi': 'Both',
        'ambidestro': 'Both',
        # Tedesco
        'rechts': 'Right',
        'links': 'Left',
        'beidfu��ig': 'Both',
        # Francese
        'droit': 'Right',
        'gauche': 'Left',
        'les deux': 'Both',
        # Spagnolo
        'derecho': 'Right',
        'izquierdo': 'Left',
        'ambos': 'Both'
    }
    
    return foot_mapping.get(foot_lower, 'Right')


def get_role_abbreviation(position: str) -> str:
    """
    Mappa la posizione Transfermarkt all'abbreviazione usata nel campo tattico (SEMPRE IN INGLESE)
    
    Args:
        position: Posizione da Transfermarkt (es: "Terzino sinistro", "Left-Back", "Linksverteidiger")
        
    Returns:
        Abbreviazione inglese (es: "LB", "CB", "ST")
    """
    if not position:
        return 'MF'
    
    # Pulisci il nome (rimuovi prefissi multilingua)
    clean_pos = position
    prefixes = ['Difesa - ', 'Centrocampo - ', 'Attacco - ', 'Defense - ', 'Midfield - ', 'Attack - ', 
                'Abwehr - ', 'Mittelfeld - ', 'Sturm - ', 'Défense - ', 'Milieu - ', 'Attaque - ']
    for prefix in prefixes:
        clean_pos = clean_pos.replace(prefix, '')
    clean_pos = clean_pos.strip()
    
    # Mappa completa delle abbreviazioni INGLESI (allineata con TacticalFieldSimple.js)
    abbr_map = {
        # Portieri -> GK
        'Portiere': 'GK',
        'Porta': 'GK',
        'GK': 'GK',
        'Goalkeeper': 'GK',
        'Torwart': 'GK',
        'Gardien': 'GK',
        'Portero': 'GK',
        
        # Difensori centrali -> CB
        'Difensore centrale': 'CB',
        'Difensore centrale sinistro': 'LCB',
        'Difensore centrale destro': 'RCB',
        'CB': 'CB',
        'CB-L': 'LCB',
        'CB-R': 'RCB',
        'Centre-Back': 'CB',
        'Center-Back': 'CB',
        'Innenverteidiger': 'CB',
        'Défenseur central': 'CB',
        'Defensa central': 'CB',
        
        # Terzini -> LB/RB
        'Terzino sinistro': 'LB',
        'Terzino destro': 'RB',
        'LB': 'LB',
        'RB': 'RB',
        'Left-Back': 'LB',
        'Right-Back': 'RB',
        'Linksverteidiger': 'LB',
        'Rechtsverteidiger': 'RB',
        'Latéral gauche': 'LB',
        'Latéral droit': 'RB',
        'Lateral izquierdo': 'LB',
        'Lateral derecho': 'RB',
        
        # Esterni (wingback) -> LWB/RWB
        'Esterno sinistro': 'LWB',
        'Esterno destro': 'RWB',
        'Esterno di sinistra': 'LWB',
        'Esterno di destra': 'RWB',
        'LWB': 'LWB',
        'RWB': 'RWB',
        'Left Wing-Back': 'LWB',
        'Right Wing-Back': 'RWB',
        'Linker Flügelverteidiger': 'LWB',
        'Rechter Flügelverteidiger': 'RWB',
        
        # Mediani -> DM
        'Mediano': 'DM',
        'Mediano sinistro': 'LDM',
        'Mediano destro': 'RDM',
        'CDM': 'DM',
        'CDM-L': 'LDM',
        'CDM-R': 'RDM',
        'Defensive Midfield': 'DM',
        'Defensives Mittelfeld': 'DM',
        'Milieu défensif': 'DM',
        'Mediocampista defensivo': 'DM',
        
        # Centrocampisti centrali -> CM
        'Centrocampista': 'CM',
        'Centrocampista centrale': 'CM',
        'Centrocampista sinistro': 'LCM',
        'Centrocampista destro': 'RCM',
        'CM': 'CM',
        'CM-L': 'LCM',
        'CM-R': 'RCM',
        'Central Midfield': 'CM',
        'Zentrales Mittelfeld': 'CM',
        'Milieu central': 'CM',
        'Mediocampista central': 'CM',
        
        # Mezzali -> LCM/RCM
        'Mezzala sinistra': 'LCM',
        'Mezzala destra': 'RCM',
        'LCM': 'LCM',
        'RCM': 'RCM',
        
        # Trequartisti -> AM
        'Trequartista': 'AM',
        'Trequartista sinistro': 'LAM',
        'Trequartista destro': 'RAM',
        'CAM': 'AM',
        'CAM-L': 'LAM',
        'CAM-R': 'RAM',
        'Attacking Midfield': 'AM',
        'Offensives Mittelfeld': 'AM',
        'Milieu offensif': 'AM',
        'Mediocampista ofensivo': 'AM',
        
        # Ali -> LW/RW
        'Ala sinistra': 'LW',
        'Ala destra': 'RW',
        'LW': 'LW',
        'RW': 'RW',
        'Left Winger': 'LW',
        'Right Winger': 'RW',
        'Linksaußen': 'LW',
        'Rechtsaußen': 'RW',
        'Ailier gauche': 'LW',
        'Ailier droit': 'RW',
        'Extremo izquierdo': 'LW',
        'Extremo derecho': 'RW',
        
        # Seconde punte -> SS
        'Seconda punta': 'SS',
        'Seconda punta sinistra': 'LSS',
        'Seconda punta destra': 'RSS',
        'SS': 'SS',
        'SS-L': 'LSS',
        'SS-R': 'RSS',
        'Second Striker': 'SS',
        'Hängende Spitze': 'SS',
        'Deuxième attaquant': 'SS',
        'Segundo delantero': 'SS',
        
        # Attaccanti -> ST
        'Attaccante': 'ST',
        'Attaccante sinistro': 'LST',
        'Attaccante destro': 'RST',
        'Punta': 'ST',
        'ST': 'ST',
        'ST-L': 'LST',
        'ST-R': 'RST',
        'Centre-Forward': 'ST',
        'Center-Forward': 'ST',
        'Striker': 'ST',
        'Mittelstürmer': 'ST',
        'Avant-centre': 'ST',
        'Delantero centro': 'ST'
    }
    
    # Cerca corrispondenza esatta
    if abbr_map.get(clean_pos):
        return abbr_map[clean_pos]
    
    # Cerca corrispondenza esatta con posizione originale
    if abbr_map.get(position):
        return abbr_map[position]
    
    # Cerca corrispondenza parziale (case insensitive)
    lower_pos = clean_pos.lower()
    for key, value in abbr_map.items():
        if key.lower() in lower_pos or lower_pos in key.lower():
            return value
    
    # Fallback: MF (Midfielder)
    return 'MF'


def extract_market_value_number(market_value: str) -> int:
    """Estrae il valore numerico dal valore di mercato"""
    if not market_value:
        return 3
    
    # Cerca pattern come "3,50 mln €"
    import re
    match = re.search(r'(\d+[,.]?\d*)', market_value)
    if match:
        value = float(match.group(1).replace(',', '.'))
        if 'mln' in market_value.lower() or 'mil' in market_value.lower():
            return int(value)
        elif 'mila' in market_value.lower() or 'k' in market_value.lower():
            return 1
    
    return 3


# Funzione generate_notes() rimossa - le note devono essere compilate manualmente dallo scout


def map_to_database_format(tm_data: Dict) -> Dict:
    """
    Mappa i dati di Transfermarkt al formato del database scouting
    
    Args:
        tm_data: Dati estratti da Transfermarkt
        
    Returns:
        Dizionario nel formato del database
    """
    # Estrai posizioni
    position = tm_data.get('position', '')
    natural_pos = tm_data.get('natural_position', '')
    other_pos = tm_data.get('other_positions', '')
    
    # Calcola abbreviazioni
    position_abbr = get_role_abbreviation(position)
    natural_abbr = get_role_abbreviation(natural_pos) if natural_pos else None
    other_abbr = get_role_abbreviation(other_pos) if other_pos else None
    
    # Mappa al formato database
    db_data = {
        'name': tm_data.get('name', ''),
        'birth_year': tm_data.get('birth_year'),
        'birth_place': tm_data.get('birth_place', ''),
        'team': tm_data.get('current_club', ''),
        'nationality': tm_data.get('nationality_primary', ''),
        'height_cm': tm_data.get('height_cm'),
        'weight_kg': tm_data.get('weight_kg'),
        'shirt_number': tm_data.get('shirt_number'),
        'general_role': map_position_to_role(position),
        'specific_position': position_abbr,  # Abbreviazione INGLESE
        'preferred_foot': map_foot(tm_data.get('preferred_foot', '')),  # INGLESE
        'market_value': f"{tm_data.get('market_value', 3):.2f} mln €" if tm_data.get('market_value') else '3.00 mln €',
        'market_value_updated': tm_data.get('market_value_updated', ''),
        'contract_expiry': tm_data.get('contract_expiry', ''),
        'transfermarkt_link': tm_data.get('url', ''),
        'profile_image': tm_data.get('profile_image', ''),
        'natural_position': natural_abbr,  # Usa abbreviazione
        'other_positions': other_abbr,  # Usa abbreviazione
        'field_position_x': tm_data.get('field_position_x'),
        'field_position_y': tm_data.get('field_position_y'),
        'current_value': int(tm_data.get('market_value', 3)) if tm_data.get('market_value') else 3,
        'potential_value': int(tm_data.get('market_value', 3)) if tm_data.get('market_value') else 3,
        # Campi da compilare manualmente dallo scout (lasciati vuoti)
        'priority': None,
        'director_feedback': None,
        'check_type': None,
        'notes': None,
        # Mantieni anche i nomi completi per riferimento
        'position_full_name': position,
        'natural_position_full_name': natural_pos,
        'other_positions_full_name': other_pos
    }
    
    return db_data


# ========================================
# MAIN - ESEMPI DI UTILIZZO
# ========================================

def main():
    """Funzione principale con esempi di utilizzo"""
    
    print("=" * 70)
    print("🔍 TRANSFERMARKT PLAYER SCRAPER")
    print("=" * 70)
    print()
    
    # Esempio 1: URL dal comando
    example_url = "https://www.transfermarkt.it/filipe-relvas/profil/spieler/567497"
    
    print(f"📍 Esempio URL: {example_url}")
    print()
    
    # Crea scraper
    scraper = TransfermarktScraper()
    
    # Estrai dati
    player_data = scraper.get_player_info(example_url)
    
    # Mostra risultati
    if 'error' in player_data:
        print(f"❌ Errore: {player_data['error']}")
        return
    
    print("\n" + "=" * 70)
    print("📊 DATI ESTRATTI:")
    print("=" * 70)
    print()
    
    # Mostra dati principali
    important_fields = [
        'name', 'age', 'birth_year', 'birth_place', 'nationality_primary',
        'height', 'position', 'preferred_foot', 'current_club', 
        'market_value', 'shirt_number', 'contract_expiry'
    ]
    
    for field in important_fields:
        if field in player_data:
            print(f"  {field.replace('_', ' ').title()}: {player_data[field]}")
    
    print()
    print("=" * 70)
    
    # Salva in JSON
    filename = scraper.save_to_json(player_data)
    
    # Mappa al formato database
    print("\n" + "=" * 70)
    print("🗄️  FORMATO DATABASE:")
    print("=" * 70)
    print()
    
    db_format = map_to_database_format(player_data)
    
    for key, value in db_format.items():
        if key != 'notes':  # Notes sono troppo lunghe
            print(f"  {key}: {value}")
    
    # Salva anche il formato database
    db_filename = filename.replace('.json', '_db_format.json')
    with open(db_filename, 'w', encoding='utf-8') as f:
        json.dump(db_format, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Formato database salvato in: {db_filename}")
    
    print("\n" + "=" * 70)
    print("✅ COMPLETATO!")
    print("=" * 70)
    
    # Esempio interattivo
    print("\n\n📝 Vuoi cercare un altro giocatore? (y/n): ", end='')
    try:
        choice = input().strip().lower()
        if choice == 'y':
            print("\n🔗 Inserisci l'URL del profilo Transfermarkt: ", end='')
            custom_url = input().strip()
            if custom_url:
                print()
                custom_data = scraper.get_player_info(custom_url)
                if 'error' not in custom_data:
                    scraper.save_to_json(custom_data)
                    print(f"\n✅ Dati estratti per: {custom_data.get('name', 'Giocatore')}")
                else:
                    print(f"\n❌ {custom_data['error']}")
    except (EOFError, KeyboardInterrupt):
        print("\n\n👋 Arrivederci!")


if __name__ == "__main__":
    main()


# ========================================
# ESEMPI DI USO COME MODULO
# ========================================

"""
# Esempio 1: Uso base
from transfermarkt_scraper import get_player_info

url = "https://www.transfermarkt.it/erling-haaland/profil/spieler/418560"
data = get_player_info(url)
print(data)

# Esempio 2: Con salvataggio
from transfermarkt_scraper import TransfermarktScraper

scraper = TransfermarktScraper()
data = scraper.get_player_info(url)
scraper.save_to_json(data, "haaland.json")

# Esempio 3: Mappatura database
from transfermarkt_scraper import get_player_info, map_to_database_format

data = get_player_info(url)
db_format = map_to_database_format(data)
print(db_format)

# Esempio 4: Multiple URLs
urls = [
    "https://www.transfermarkt.it/player1/profil/spieler/123",
    "https://www.transfermarkt.it/player2/profil/spieler/456",
]

scraper = TransfermarktScraper()
for url in urls:
    data = scraper.get_player_info(url)
    if 'error' not in data:
        scraper.save_to_json(data)
"""