FROM tensorflow/tensorflow:2.9.3


ENV DEBIAN_FRONTEND=noninteractive
ENV TF_FORCE_GPU_ALLOW_GROWTH=true
ENV TF_CPP_MIN_LOG_LEVEL=2

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    ffmpeg \
    libsndfile1 \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p /app/uploads /app/outputs /app/temp

ENV PYTHONPATH=/app
EXPOSE 5000
CMD ["python", "app.py"]