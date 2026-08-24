FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD sh -c "python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --workers 1"
