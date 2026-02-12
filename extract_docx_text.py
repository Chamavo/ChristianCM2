import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # XML namespace for Word
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            text_content = []
            for p in tree.findall('.//w:p', namespaces):
                paragraph_text = []
                for t in p.findall('.//w:t', namespaces):
                    if t.text:
                        paragraph_text.append(t.text)
                text_content.append(''.join(paragraph_text))
            
            return '\n'.join(text_content)
    except Exception as e:
        return f"Error reading .docx file: {e}"

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) < 2:
        print("Usage: python extract_docx_text.py <path_to_docx>")
    else:
        file_path = sys.argv[1]
        if os.path.exists(file_path):
            print(extract_text(file_path))
        else:
            print(f"File not found: {file_path}")
