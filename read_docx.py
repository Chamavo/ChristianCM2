
import zipfile
import re
import xml.etree.ElementTree as ET

DOCX_PATH = r"C:\Users\ACER\Downloads\Module problèmes\ProgrammeCM1.docx"

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # Namespace for word processing ML
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            text_parts = []
            for node in tree.iter():
                if node.tag.endswith('}t'): # Text node
                    if node.text:
                        text_parts.append(node.text)
                elif node.tag.endswith('}br') or node.tag.endswith('}p'): # Break or Paragraph
                    text_parts.append('\n')
            
            return "".join(text_parts)
    except Exception as e:
        return f"Error reading DOCX: {e}"

if __name__ == "__main__":
    content = extract_text_from_docx(DOCX_PATH)
    print(content)
