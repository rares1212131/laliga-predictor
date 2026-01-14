# ai-engine/Dockerfile
FROM python:3.10-slim

# Install system dependencies for Postgres (psycopg2) and gcc for building libraries
RUN apt-get update && apt-get install -y libpq-dev gcc

# Set work directory
WORKDIR /app

# Copy requirements first (caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code AND the models folder
COPY . .

# Run the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]