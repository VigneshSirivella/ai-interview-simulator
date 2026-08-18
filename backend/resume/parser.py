import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from docx import Document


def extract_text(file_path):
    text = ""

    if file_path.lower().endswith(".pdf"):
        # First try normal PDF text extraction
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        # If scanned PDF, OCR one page at a time
        # to avoid Render memory crash
        if not text.strip():
            with pdfplumber.open(file_path) as pdf:
                total_pages = min(len(pdf.pages), 5)

            for page_number in range(1, total_pages + 1):
                images = convert_from_path(
                    file_path,
                    dpi=120,
                    first_page=page_number,
                    last_page=page_number,
                    grayscale=True,
                )

                if images:
                    text += pytesseract.image_to_string(images[0]) + "\n"

                del images

    elif file_path.lower().endswith(".docx"):
        doc = Document(file_path)

        for para in doc.paragraphs:
            text += para.text + "\n"

    elif file_path.lower().endswith(".txt"):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
            text = file.read()

    return text
