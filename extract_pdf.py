import pypdf
import sys

try:
    reader = pypdf.PdfReader("C:/Users/ACER/Downloads/Module français/101-dictees.pdf")
    with open("extracted_dictations.txt", "w", encoding="utf-8") as f:
        for page in reader.pages:
            f.write(page.extract_text() + "\n")
    print("Extraction complete.")
except Exception as e:
    print(f"Error: {e}")
