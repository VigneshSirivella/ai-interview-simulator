import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from docx import Document


def extract_text(file_path):
    text = ""

    if file_path.endswith(".pdf"):
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        if not text.strip():
            images = convert_from_path(file_path)
            for image in images:
                text += pytesseract.image_to_string(image)

    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"

    return text
