#!/usr/bin/env python3
"""
Apply runtime translations to React components
Adds import and uses translate functions for dynamic content
"""

import os
import re
from pathlib import Path

COMPONENTS_DIR = Path('/Users/alessioecca/windsurf/scouting_database/scouting-app/src/components')

# Files to process
FILES_TO_PROCESS = [
    'PlayerCard.js',
    'PlayerCompactCard.js',
    'PlayerDetailCardFM.js',
    'PlayerTable.js',
    'Database.js',
    'TacticalFieldSimple.js',
    'PlayerDetail.js',
]

def add_import_if_missing(content, file_name):
    """Add translate import if not present"""
    if 'from \'../utils/translate\'' in content or 'from "../utils/translate"' in content:
        print(f"   ✅ Import già presente in {file_name}")
        return content, False
    
    # Find first import
    import_match = re.search(r'^import\s+', content, re.MULTILINE)
    if not import_match:
        print(f"   ⚠️  Nessun import trovato in {file_name}")
        return content, False
    
    # Add after first import
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('import '):
            # Insert after this import
            lines.insert(i + 1, "import { translateRole, translatePosition, translateFoot } from '../utils/translate';")
            print(f"   ✅ Import aggiunto in {file_name}")
            return '\n'.join(lines), True
    
    return content, False

def apply_translations(content, file_name):
    """Apply translation functions to dynamic content"""
    changes = 0
    
    # Translate player.general_role
    patterns = [
        (r'{player\.general_role}', '{translateRole(player.general_role)}'),
        (r'{player\.general_role \|\| [\'"]N/D[\'"]}'  , '{translateRole(player.general_role) || \'N/A\'}'),
        (r'{player\.general_role \|\| [\'"]N/A[\'"]}'  , '{translateRole(player.general_role) || \'N/A\'}'),
    ]
    
    for pattern, replacement in patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes += 1
    
    # Translate player.preferred_foot
    patterns = [
        (r'{player\.preferred_foot}', '{translateFoot(player.preferred_foot)}'),
        (r'{player\.preferred_foot \|\| [\'"]N/D[\'"]}'  , '{translateFoot(player.preferred_foot) || \'N/A\'}'),
        (r'{player\.preferred_foot \|\| [\'"]N/A[\'"]}'  , '{translateFoot(player.preferred_foot) || \'N/A\'}'),
    ]
    
    for pattern, replacement in patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes += 1
    
    # Translate player.specific_position
    patterns = [
        (r'{player\.specific_position}', '{translatePosition(player.specific_position)}'),
        (r'{player\.specific_position \|\| [\'"]N/D[\'"]}'  , '{translatePosition(player.specific_position) || \'N/A\'}'),
        (r'{player\.specific_position \|\| [\'"]N/A[\'"]}'  , '{translatePosition(player.specific_position) || \'N/A\'}'),
    ]
    
    for pattern, replacement in patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes += 1
    
    # Translate "anni" to "years"
    content = re.sub(r'(\{age\})\s+anni', r'\1 years', content)
    if 'years' in content and 'anni' not in content:
        changes += 1
    
    # Translate "N/D" to "N/A" (not already translated)
    old_content = content
    content = re.sub(r'[\'"]N/D[\'"]', "'N/A'", content)
    if content != old_content:
        changes += 1
    
    return content, changes

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Add import
        content, import_added = add_import_if_missing(content, file_path.name)
        
        # Apply translations
        content, translation_changes = apply_translations(content, file_path.name)
        
        # Save if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return import_added, translation_changes
        
        return False, 0
        
    except Exception as e:
        print(f"   ❌ Errore: {e}")
        return False, 0

def main():
    """Process all files"""
    print("🔄 APPLICAZIONE TRADUZIONI RUNTIME")
    print("=" * 80)
    
    total_imports = 0
    total_translations = 0
    
    for file_name in FILES_TO_PROCESS:
        file_path = COMPONENTS_DIR / file_name
        
        if not file_path.exists():
            print(f"\n⏭️  {file_name} - File non trovato")
            continue
        
        print(f"\n📝 Processando: {file_name}")
        import_added, changes = process_file(file_path)
        
        if import_added:
            total_imports += 1
        if changes > 0:
            print(f"   ✅ {changes} traduzioni applicate")
            total_translations += changes
        elif not import_added:
            print(f"   ⏭️  Nessuna modifica necessaria")
    
    print("\n" + "=" * 80)
    print(f"✅ COMPLETATO!")
    print(f"   Import aggiunti: {total_imports}")
    print(f"   Traduzioni applicate: {total_translations}")
    print("=" * 80)

if __name__ == "__main__":
    main()
