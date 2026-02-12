import re
import json
import os

def parse_dictations(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    dictations = []
    current_dictee = None
    state = "SEARCHING" # SEARCHING, READING

    # Regex for "1 - Title - Text" or "1 - Title"
    header_pattern = re.compile(r"^(\d+)\s*-\s*(.+?)\s*-\s*(.*)")
    
    # Regex to catch "1 - Title" (text starts next line? rare but possible)
    header_pattern_simple = re.compile(r"^(\d+)\s*-\s*(.+)$")

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Skip page footers/headers
        if "Jean-Luc Madoré" in line or "101 dictées pour le CM2" in line:
            continue

        if "Proposition de préparation" in line:
            if current_dictee:
                # cleanup author from text if present
                # Assumption: Last 'sentence' might be author if it doesn't end in punctuation or is short/distinct
                # But looking at the file, authors are often on their own line.
                # Let's simple-heuristic: last chunk of text if short might be author.
                
                # Check for explicit author line just added?
                pass
                
            state = "SEARCHING"
            continue

        match = header_pattern.match(line)
        if match:
            if current_dictee:
                 dictations.append(current_dictee)
            
            dic_id = int(match.group(1))
            if dic_id > 50:
                break # Only need first 50
                
            title = match.group(2).strip()
            initial_text = match.group(3).strip()
            
            current_dictee = {
                "id": dic_id,
                "titre": title,
                "texte_lines": [initial_text] if initial_text else [],
                "auteur": ""
            }
            state = "READING"
            continue
            
        # Try simple header match if detailed failed (e.g. no text on first line)
        # But looking at file, they all seem to follow "Num - Title - TextStart"
        
        if state == "READING":
            # Heuristic for author: usually the line before "Proposition"
            # We see "Richard Chapelle", "Colette", "Henri Bosco" etc.
            # They are usually short.
            # We will process this after collecting all lines for a dictation.
            current_dictee["texte_lines"].append(line)

    if current_dictee and current_dictee["id"] <= 50:
        dictations.append(current_dictee)

    
    # Post-processing to separate Author and Text
    final_dictations = []
    seen_ids = set()
    
    for d in dictations:
        if d["id"] in seen_ids:
            continue
        seen_ids.add(d["id"])
        
        lines = d["texte_lines"]
        # Remove empty strings
        lines = [l for l in lines if l]
        
        author = ""
        text_lines = lines
        
        if lines:
            last_line = lines[-1]
            # Heuristics for author:
            # - Short (< 50 chars)
            # - Doesn't end in '.' (unless abbreviation) OR contains known author names
            # - Or name-like (Capitalized)
            
            # Specific fix for #18 "lentement. Guy de Maupassant"
            if "Guy de Maupassant" in last_line:
                 if last_line.strip().endswith("Guy de Maupassant"):
                      # Split if previous part is sentence end
                      parts = last_line.split("Guy de Maupassant")
                      if len(parts) > 1 and parts[0].strip().endswith("."):
                           text_lines = lines[:-1] + [parts[0].strip()]
                           author = "Guy de Maupassant"
                      else:
                           author = last_line
                           text_lines = lines[:-1]
            
            elif len(last_line) < 50 and not last_line.strip().endswith('.') and not last_line.strip().endswith('!'):
                 author = last_line
                 text_lines = lines[:-1]
            elif last_line in ["Colette", "Henri Bosco", "Victor Hugo", "Maurice Genevoix", "Alphonse Daudet", "Gaston Rebuffat"]: 
                 author = last_line
                 text_lines = lines[:-1]
                 
        full_text = " ".join(text_lines).replace("  ", " ").strip()
        
        final_dictations.append({
            "id": d["id"],
            "titre": d["titre"],
            "texte": full_text,
            "auteur": author,
            "niveau": "CM1"
        })

    return final_dictations

def generate_ts_file(dictations, output_path):
    ts_content = "export interface Dictee {\n"
    ts_content += "  id: number;\n"
    ts_content += "  titre: string;\n"
    ts_content += "  texte: string;\n"
    ts_content += "  auteur: string;\n"
    ts_content += "  niveau: string;\n"
    ts_content += "}\n\n"
    
    ts_content += "export const dictees: Dictee[] = [\n"
    for d in dictations:
        ts_content += "  {\n"
        ts_content += f"    id: {d['id']},\n"
        ts_content += f"    titre: {json.dumps(d['titre'])},\n"
        ts_content += f"    texte: {json.dumps(d['texte'])},\n"
        ts_content += f"    auteur: {json.dumps(d['auteur'])},\n"
        ts_content += f"    niveau: {json.dumps(d['niveau'])}\n"
        ts_content += "  },\n"
    ts_content += "];\n"

    with open(output_path, "w", encoding='utf-8') as f:
        f.write(ts_content)
    print(f"Generated {output_path} with {len(dictations)} dictations.")

if __name__ == "__main__":
    dicts = parse_dictations("extracted_dictations.txt")
    generate_ts_file(dicts, "src/data/dictees.ts")
