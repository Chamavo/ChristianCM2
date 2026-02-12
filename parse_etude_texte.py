import re
import json
import os

def get_section_num(text):
    match = re.search(r'\b(I|II|III|IV|V|VI)\b', text)
    return match.group(1) if match else "0"

def read_file(path):
    for enc in ['cp1252', 'utf-8', 'latin-1']:
        try:
            with open(path, 'r', encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    raise Exception(f"Could not read {path} with common encodings")

def parse_text_subjects(content):
    subjects = re.split(r'Sujet (\d+)', content)
    parsed_subjects = {}
    
    for i in range(1, len(subjects), 2):
        subject_id = int(subjects[i])
        subject_content = subjects[i+1].strip()
        
        section_pattern = r'\n(?=(?:I|II|III|IV|V|VI)\b[ .-]?)'
        parts = re.split(section_pattern, subject_content)
        
        text = parts[0].strip()
        text = re.sub(r'═+', '', text)
        text = re.sub(r'\s*(?:QUESTIONS|CONSIGNES|Questions)\s*(\(\d+\s*pts\))?$', '', text, flags=re.IGNORECASE | re.MULTILINE).strip()
        
        sections = parts[1:]
        q_list = []
        q_counter = 1
        
        for section in sections:
            section_lines = section.strip().split('\n')
            if not section_lines: continue
            
            section_header = section_lines[0]
            sec_num = get_section_num(section_header)
            
            section_raw = '\n'.join(section_lines[1:])
            q_matches = re.findall(r'(\d+)[). /-]\s*(.*?)(?=\n\d+[). /-]|\Z)', section_raw, re.DOTALL)
            
            for q_num, q_text in q_matches:
                clean_q = re.sub(r'\(\d+\s*pts?\)', '', q_text).strip()
                q_list.append({
                    "original_id": int(q_num),
                    "section": sec_num,
                    "id": q_counter,
                    "question": clean_q.replace('\n', ' '),
                    "expectedAnswer": ""
                })
                q_counter += 1
            
        parsed_subjects[subject_id] = {
            "title": f"Sujet {subject_id}",
            "content": text,
            "questions": q_list
        }
    return parsed_subjects

def parse_answers(content, subjects_data):
    subjects = re.split(r'## SUJET (\d+)', content)
    
    for i in range(1, len(subjects), 2):
        subject_id = int(subjects[i])
        subject_content = subjects[i+1].strip()
        
        # Stop at footer markers
        subject_content = re.split(r'\n(?:\s*---\s*|\s*# CRIT)', subject_content)[0]
        
        if subject_id in subjects_data:
            sections = re.split(r'###\s*(.*?)\n', subject_content)
            current_sec_num = "0"
            for j in range(0, len(sections)):
                part = sections[j].strip()
                if j % 2 == 1:
                    current_sec_num = get_section_num(part)
                else:
                    a_matches = re.findall(r'(?:\*\*|)(\d+)\..*?\n-\s*(.*?)(?=\n(?:\*\*|)\d+\.|\n###|\n---|\n#|\Z)', part, re.DOTALL)
                    for a_num, a_text in a_matches:
                        a_num_int = int(a_num)
                        for q in subjects_data[subject_id]["questions"]:
                            if q["section"] == current_sec_num and q["original_id"] == a_num_int:
                                q["expectedAnswer"] = a_text.strip()
    return subjects_data

def generate_ts_file(data, output_path):
    ts_content = """export interface TextStudy {
    id: number;
    title: string;
    content: string;
    questions: {
        id: number;
        question: string;
        expectedAnswer: string;
    }[];
}

export const etudeTexteData: TextStudy[] = [
"""
    
    for sid in sorted(data.keys()):
        s = data[sid]
        if not s["content"].strip() or not s["questions"]:
            continue
            
        ts_content += "    {\n"
        ts_content += f"        id: {sid},\n"
        ts_content += f"        title: {json.dumps(s['title'], ensure_ascii=False)},\n"
        ts_content += f"        content: {json.dumps(s['content'], ensure_ascii=False)},\n"
        ts_content += "        questions: [\n"
        
        for q in s["questions"]:
            ts_content += "            {\n"
            ts_content += f"                id: {q['id']},\n"
            ts_content += f"                question: {json.dumps(q['question'], ensure_ascii=False)},\n"
            ts_content += f"                expectedAnswer: {json.dumps(q['expectedAnswer'], ensure_ascii=False)}\n"
            ts_content += "            },\n"
            
        ts_content += "        ]\n"
        ts_content += "    },\n"
    ts_content += "];\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

if __name__ == "__main__":
    base_dir = r"C:\Users\ACER\Downloads\Projets GitHub\ChristianCM2"
    txt_file = base_dir + r"\Etude-de-textes.txt"
    md_file = base_dir + r"\elements_de_reponse.md"
    output_ts = base_dir + r"\src\data\etudeTexteData.ts"
    
    txt_content = read_file(txt_file)
    md_content = read_file(md_file)
    
    data = parse_text_subjects(txt_content)
    data = parse_answers(md_content, data)
    generate_ts_file(data, output_ts)
    print(f"Successfully generated {output_ts}")
