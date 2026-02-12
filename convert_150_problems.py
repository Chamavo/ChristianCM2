import re
import json
import os

INPUT_FILE = r"C:\Users\ACER\Downloads\Projets GitHub\andrewcm1\150_problemes_maths_v1.txt"
OUTPUT_FILE = r"C:\Users\ACER\Downloads\Projets GitHub\andrewcm1\src\data\maths\problems150.json"

def parse_problems(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    problems = []
    current_problem = {}
    current_text = []
    
    # State machine
    # 0: Searching for start
    # 1: Reading text/questions
    # 2: Reading response
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Detect Start Format 1: "1. **Title**"
        match1 = re.match(r"^(\d+)\.\s+\*\*(.+)\*\*", line)
        
        # Detect Start Format 2: "## **101**" (No title, just number)
        match2 = re.match(r"^##\s+\*\*(\d+)\*\*", line)
        
        if match1 or match2:
            # Save previous if exists
            if current_problem:
                current_problem['text'] = "\n".join(current_text).strip()
                problems.append(current_problem)
                current_problem = {}
                current_text = []

            if match1:
                current_problem['id'] = int(match1.group(1))
                current_problem['title'] = match1.group(2).strip()
            else:
                current_problem['id'] = int(match2.group(1))
                current_problem['title'] = f"Problème {match2.group(1)}" # Fallback title
                
            current_problem['part'] = 1 if current_problem['id'] <= 50 else (2 if current_problem['id'] <= 100 else 3)
            i += 1
            continue

        # Detect Response
        if line.startswith("*Réponse") or line.startswith("**Réponse"):
            # This marks the end of the question text for now, we capture the response line
            current_problem['answer'] = line.replace("*", "").replace("Réponse :", "").strip()
            # If multi-line response (Format 2), read until next problem or end
            if not current_problem['answer']: # Empty line after bold header
                answer_lines = []
                i += 1
                while i < len(lines):
                    sub_line = lines[i].strip()
                    if sub_line.startswith("##") or sub_line.startswith("---"):
                        i -= 1 # Backtrack
                        break
                    if sub_line: answer_lines.append(sub_line)
                    i += 1
                current_problem['answer'] = "\n".join(answer_lines)
            
            # We don't advance i here significantly inside the if, the outer loop advances
        
        elif line.startswith("## Partie"):
            pass # Skip section headers
        elif line.startswith("---"):
            pass # Skip separators
        elif line:
            # Accumulate text (question body)
            # We might want to separate "Text" from "Questions" (a), b) or 1., 2.)
            # For now, putting everything in 'text' field is easiest for display.
            # Or we can try to detect questions.
            current_text.append(line)
            
        i += 1

    # Add last problem
    if current_problem:
        current_problem['text'] = "\n".join(current_text).strip()
        problems.append(current_problem)

    return problems

if __name__ == "__main__":
    data = parse_problems(INPUT_FILE)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        
    print(f"Parsed {len(data)} problems.")
