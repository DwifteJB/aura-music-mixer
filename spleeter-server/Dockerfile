# Use CUDA 11.2 for TensorFlow 2.9.x compatibility
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV CUDA_VISIBLE_DEVICES=0
ENV TF_FORCE_GPU_ALLOW_GROWTH=true
# Disable TF warnings
ENV TF_CPP_MIN_LOG_LEVEL=2

# Install Python and dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    ffmpeg \
    libsndfile1 \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic links for python
RUN ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Copy requirements first
COPY requirements.txt .

# Upgrade pip
RUN python3 -m pip install --upgrade pip

# Install Python packages
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/uploads /app/outputs /app/temp

ENV PYTHONPATH=/app

# Test GPU after everything is installed
RUN python -c "import tensorflow as tf; print('TensorFlow version:', tf.__version__); print('GPU Available:', len(tf.config.list_physical_devices('GPU')), 'device(s)')"

EXPOSE 5000

CMD ["python", "app.py"]