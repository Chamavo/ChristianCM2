
import json
import re
import os

FILE_1 = r"C:\Users\ACER\Downloads\Projets GitHub\andrewcm1\150_problemes_maths_v1.txt"
FILE_2 = r"C:\Users\ACER\Downloads\Projets GitHub\andrewcm1\Pour aller plus loin.txt"
FILE_3 = r"C:\Users\ACER\Downloads\Projets GitHub\andrewcm1\nouveaux_problemes_121_135.txt"
OUTPUT_FILE = r"C:\Users\ACER\Downloads\Projets GitHub\andrewcm1\src\data\maths\problems150.json"

def parse_file(file_path, default_part=1):
    problems = []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    current_title = ""
    current_id = None
    current_text = []
    current_answer = []
    state = "CONTEXT"
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        # Detect Exercise Start
        # Format 1: "1. **Title**"
        match1 = re.match(r'^(\d+)\.\s*\*\*(.*?)\*\*', line)
        # Format 2: "### **Exercice N**"
        match2 = re.match(r'### \*\*Exercice (\d+)\*\*', line)
        # Format 3: "## **N**" (seen at end of file 1)
        match3 = re.match(r'^## \*\*(\d+)\*\*', line)
        
        new_id = None
        new_title = ""
        
        if match1:
            new_id = int(match1.group(1))
            new_title = match1.group(2).strip()
        elif match2:
            new_id = int(match2.group(1))
            new_title = f"Problème {new_id}"
        elif match3:
            new_id = int(match3.group(1))
            new_title = f"Problème {new_id}"
            
        if new_id:
            # Save previous
            if current_id:
                save_problem(problems, current_id, current_title, current_text, current_answer)
            
            current_id = new_id
            current_title = new_title
            current_text = []
            current_answer = []
            state = "CONTEXT"
            continue
            
        if current_id:
             # Check for Answer start
             if "*Réponse :" in line: # File 1 specific
                 state = "ANSWER"
                 # Extract content after marker
                 ans = line.replace("*Réponse :", "").replace("*", "").strip()
                 if ans: current_answer.append(ans)
             elif "**Question" in line: # File 2 specific
                 # For File 2, Question is part of text usually, but we want it in text.
                 # But we also use it to delimit answer section start?
                 # File 2 puts answer AFTER Question line.
                 q = line.replace("**Question", "").replace(":", "").replace("**", "").strip()
                 current_text.append(q)
                 state = "ANSWER" # Next lines are answer
             elif "**Solution" in line:
                 state = "ANSWER"
                 ans = line.replace("**Solution", "").replace(":", "").replace("**", "").replace("---", "").strip()
                 if ans: current_answer.append(ans)
             else:
                 if line == "---": continue
                 
                 if state == "CONTEXT":
                     current_text.append(line)
                 else:
                     current_answer.append(line)
    
    if current_id:
        save_problem(problems, current_id, current_title, current_text, current_answer)
        
    return problems

def save_problem(problems_list, pid, title, text_arr, ans_arr):
    full_text = "\n".join(text_arr).strip()
    ans_text = "\n".join(ans_arr).strip()
    
    # Determine Part
    part = 1
    if pid > 50: part = 2
    if pid > 100: part = 3
    if pid > 150: part = 4
    
    # Override title for part 4 if desired
    if part == 4: title = "Pour aller plus loin"
    
    # Parse QA Structure
    questions = []
    
    # Strategy 1: Named lines (a) ..., b) ... or Label : ...)
    # File 1: "a) 125 + ... = 430 cahiers. b) ..."
    # We want to extract "430" and "cahiers".
    # Regex: Look for pattern `a) ... = (\d+) (unit).` ?
    # Or just `a) ...` sections.
    
    # Let's split by a), b), c)...
    # Regex to find markers: `a)` or `1)` or `Paul :`
    
    # Normalize ans_text for regex
    
    # Try detecting a/b list first
    parts = re.split(r'\b([a-z])\)', ans_text)
    if len(parts) > 1:
        # parts[0] is preamble, parts[1] is 'a', parts[2] is content, parts[3] is 'b'...
        # Iterate pairs
        for i in range(1, len(parts), 2):
            label = parts[i] + ")" # "a)"
            content = parts[i+1].strip()
            
            # Extract number within content
            # Look for `= X unit` or just `X unit` at end.
            # Example: "125 + 210 + 95 = 430 cahiers."
            # "430 - 350 = 80 cahiers."
            
            match = re.search(r'=\s*([\d\s,]+)\s*([€a-zA-Z%²³]*)', content)
            val = ""
            unit = ""
            if match:
                 val = match.group(1).replace(" ", "").strip()
                 unit = match.group(2).strip()
            # If no '=', maybe just number at end?
            else:
                 match2 = re.search(r'([\d\s,]+)\s*([€a-zA-Z%²³]*)\.?$', content)
                 if match2:
                      val = match2.group(1).replace(" ", "").strip()
                      unit = match2.group(2).replace(".", "").strip()
            
            if val:
                questions.append({
                    "label": label,
                    "response": val,
                    "unit": unit
                })
    else:
        # Try Named Labels ("Paul :")
        named_answers = re.findall(r'(.*?)\s*:\s*([\d\s]+)\s*([€a-zA-Z%]+)', ans_text)
        if named_answers:
            for label, val, unit in named_answers:
                label_clean = label.replace(":", "").replace(")", "").strip()
                val_clean = val.replace(" ", "").strip()
                if label_clean.lower() not in ["réponse", "solution"]:
                    questions.append({
                        "label": label_clean,
                        "response": val_clean,
                        "unit": unit.strip()
                    })
        
        # If no questions yet, try single answer
        if not questions:
            # Fallback
            last_line = ans_arr[-1] if ans_arr else ""
            match = re.search(r'(=|:)?\s*([\d\s]+)\s*([€a-zA-Z%²³]+)?\.?$', last_line)
            if match:
                 val = match.group(2).replace(" ", "").strip()
                 unit = match.group(3).strip() if match.group(3) else ""
                 unit = unit.replace(".", "")
                 questions.append({ "response": val, "unit": unit })

    problems_list.append({
        "id": pid,
        "title": title,
        "part": part,
        "text": full_text,
        "answer": ans_text,
        "questions": questions
    })


if __name__ == "__main__":
    all_problems = []
    
    # Parse File 1
    print(f"Parsing {FILE_1}...")
    p1 = parse_file(FILE_1)
    all_problems.extend(p1)
    
    # Parse File 2
    print(f"Parsing {FILE_2}...")
    p2 = parse_file(FILE_2)
    all_problems.extend(p2)

    # Parse File 3 (New problems 121-135)
    print(f"Parsing {FILE_3}...")
    p3 = parse_file(FILE_3)
    all_problems.extend(p3)
    
    # Sort
    all_problems.sort(key=lambda x: x['id'])
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_problems, f, ensure_ascii=False, indent=4)
        
    print(f"Total problems: {len(all_problems)}")

