# TODO: REDIS SERVER FOR JOB QUEUE! (SHOULD I???)
# cleanup redis server by limitting the ttl to 5 mihns

# DONE: add key suppport!

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'

import tensorflow as tf

gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"Found {len(gpus)} GPU(s)")
    except RuntimeError as e:
        print(e)
else:
    print("no gpus!!!! using cpu :(")

import requests
import uuid
import shutil
from flask import Flask, request, jsonify, send_file
from spleeter.separator import Separator
import soundfile as sf
import logging
from werkzeug.utils import secure_filename
from queue import Queue
import tempfile
import time
from pydub import AudioSegment

# import redis

import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # limits upload size to 100mb

# use env for callback_url, so it can be set easilier-er
UPLOAD_FOLDER = '/app/uploads'
OUTPUT_FOLDER = '/app/outputs'
TEMP_FOLDER = '/app/temp'
CALLBACK_URL = os.getenv('MAIN_SERVER_URL', 'http://host.docker.internal:3000/api/spleeter/callback') # assuming both are hosted on same docker network
MY_URL = os.getenv('SPLEETER_API_URL', 'http://localhost:5000')
SPLEETER_KEY = os.getenv('SPLEETER_SERVER_KEY', 'your_spleeter_key_here')

# REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
# REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

# non redis queue, more lightweight than having like 30 services lol
job_queue = Queue()
job_status = {}
job_results = {}

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'flac', 'm4a', 'ogg', 'wma', 'aac'}

separator = None

def cleanup_old_files(folders, minutes=120):
    """cleanup old files in specified folders"""
    cutoff_time = time.time() - (minutes * 60)
    for folder in folders:
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            if os.path.isfile(file_path) and os.path.getmtime(file_path) < cutoff_time:
                os.remove(file_path)
                logger.info(f"Removed old file: {file_path}")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_separator():
    global separator
    if separator is None:
        logger.info("Initializing Spleeter separator...")
        separator = Separator('spleeter:2stems')
        logger.info("Spleeter separator initialized")
    return separator

def send_callback(job_id, status, vocals_url=None, instrumental_url=None, error=None):
    """callbacks for main server, use ws on main to give user status"""
    try:
        data = {
            'job_id': job_id,
            'status': status,
            'vocals_url': vocals_url,
            'instrumental_url': instrumental_url,
            'error': error
        }
        
        response = requests.post(CALLBACK_URL, json=data, timeout=30)
        response.raise_for_status()
        logger.info(f"Sent callback for job {job_id}: {status}")
    except Exception as e:
        logger.error(f"Failed to send callback for job {job_id}: {str(e)}")

def process_audio_job(job_id, input_file_path):
    temp_dir = None
    
    try:
        logger.info(f"Starting processing job {job_id}")
        job_status[job_id] = 'processing'
        
        temp_dir = tempfile.mkdtemp(dir=TEMP_FOLDER)
        
        sep = get_separator()
        
        logger.info(f"Reading audio file for job {job_id}")
        waveform, sample_rate = sf.read(input_file_path)
        logger.info(f"Original sample rate: {sample_rate}Hz, duration: {len(waveform)/sample_rate:.2f}s")
        
        logger.info(f"Separator started for job {job_id}")
        prediction = sep.separate(waveform)
        
        job_output_dir = os.path.join(OUTPUT_FOLDER, job_id)
        os.makedirs(job_output_dir, exist_ok=True)
        
        vocals_filename = f"{job_id}_vocals.wav"
        instrumental_filename = f"{job_id}_instrumental.wav"
        
        vocals_path = os.path.join(job_output_dir, vocals_filename)
        instrumental_path = os.path.join(job_output_dir, instrumental_filename)

        sf.write(vocals_path, prediction['vocals'], sample_rate)
        sf.write(instrumental_path, prediction['accompaniment'], sample_rate)

        # save as wav, convert to mp3 then delete wav (saves so much in compression)

        audioVocals = AudioSegment.from_wav(vocals_path)
        audioVocals.export(vocals_path.replace('.wav', '.mp3'), format="mp3", bitrate="192k")

        audioInstrumental = AudioSegment.from_wav(instrumental_path)
        audioInstrumental.export(instrumental_path.replace('.wav', '.mp3'), format="mp3", bitrate="192k")

        vocals_filename = vocals_filename.replace('.wav', '.mp3')
        instrumental_filename = instrumental_filename.replace('.wav', '.mp3')

        os.remove(vocals_path)
        os.remove(instrumental_path)

        logger.info(f"Audio separation completed for job {job_id}")
        
        vocals_url = f"{MY_URL}/download/{job_id}/{vocals_filename}"
        instrumental_url = f"{MY_URL}/download/{job_id}/{instrumental_filename}"

        job_status[job_id] = 'completed'
        job_results[job_id] = {
            'vocals_url': vocals_url,
            'instrumental_url': instrumental_url,
            'vocals_path': vocals_path,
            'instrumental_path': instrumental_path
        }
        
        send_callback(job_id, 'completed', vocals_url, instrumental_url)
        
        logger.info(f"Job {job_id} completed successfully")
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Job {job_id} failed: {error_msg}")
        
        job_status[job_id] = 'failed'
        job_results[job_id] = {'error': error_msg}
        
        send_callback(job_id, 'failed', error=error_msg)
        
    finally:
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
            logger.debug(f"Cleaned up temporary directory for job {job_id}")
        
        if os.path.exists(input_file_path):
            os.remove(input_file_path)
            logger.debug(f"Cleaned up input file for job {job_id}")

def worker_thread():
    logger.info("Worker thread started")
    
    while True:
        try:
            cleanup_old_files([UPLOAD_FOLDER, OUTPUT_FOLDER, TEMP_FOLDER], minutes=120) # gotta keep storage down, this is free after all :P
            job_data = job_queue.get()
            
            if job_data is None:  # shutdown
                break
                
            job_id = job_data['job_id']
            input_file_path = job_data['input_file_path']
            
            # process job
            process_audio_job(job_id, input_file_path)
            
            job_queue.task_done()
            
        except Exception as e:
            logger.error(f"Worker thread error: {str(e)}")

worker = threading.Thread(target=worker_thread, daemon=True)
worker.start()

# @app.before_request
# def before_request():
#     # cleanup old files
#     cleanup_old_files([UPLOAD_FOLDER, OUTPUT_FOLDER, TEMP_FOLDER], minutes=120)

#     # check if key is correct
#     ip = request.remote_addr
#     sentKey = request.headers.get('rmfosho-real-key')

#     if sentKey != SPLEETER_KEY:
#         logger.warning(f"{ip} used the incorrect key: {sentKey}")
#         return jsonify({'error': 'Unauthorized'}), 403



@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'spleeter-api',
        'queue_size': job_queue.qsize(),
        'separator_loaded': separator is not None
    }), 200

@app.route('/submit', methods=['POST'])
def submit_job():
    try:

        if 'audio_file' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio_file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': f'File type not allowed. Supported: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        job_id = str(uuid.uuid4())
        
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        input_filename = f"{job_id}_input.{file_extension}"
        input_file_path = os.path.join(UPLOAD_FOLDER, input_filename)
        
        file.save(input_file_path)
        logger.info(f"Saved uploaded file for job {job_id}: {input_file_path}")
        
        job_data = {
            'job_id': job_id,
            'input_file_path': input_file_path,
            'original_filename': filename
        }
        
        job_status[job_id] = 'queued'
        job_queue.put(job_data)
        
        logger.info(f"Queued job {job_id}")
        
        return jsonify({
            'job_id': job_id,
            'status': 'queued',
            'message': 'Job submitted successfully',
            'queue_position': job_queue.qsize()
        }), 202
        
    except Exception as e:
        logger.error(f"Failed to submit job: {str(e)}")
        return jsonify({'error': 'Failed to submit job'}), 500

@app.route('/status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """get job status"""
    try:
        if job_id not in job_status:
            return jsonify({'error': 'Job not found'}), 404
        
        status = job_status[job_id]
        response_data = {
            'job_id': job_id,
            'status': status,
            'queue_position': job_queue.qsize() if status == 'queued' else 0
        }
        
        if job_id in job_results:
            response_data.update(job_results[job_id])
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Failed to get job status for {job_id}: {str(e)}")
        return jsonify({'error': 'Failed to get job status'}), 500

@app.route('/download/<job_id>/<filename>', methods=['GET'])
def download_file(job_id, filename):
    try:
        file_path = os.path.join(OUTPUT_FOLDER, job_id, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(file_path, as_attachment=True, download_name=filename)
        
    except Exception as e:
        logger.error(f"Failed to download file {job_id}/{filename}: {str(e)}")
        return jsonify({'error': 'Failed to download file'}), 500

@app.route('/queue-status', methods=['GET'])
def get_queue_status():
    try:
        status_counts = {}
        for status in job_status.values():
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return jsonify({
            'queue_length': job_queue.qsize(),
            'total_jobs': len(job_status),
            'status_breakdown': status_counts,
            'separator_loaded': separator is not None
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get queue status: {str(e)}")
        return jsonify({'error': 'Failed to get queue status'}), 500

@app.route('/jobs', methods=['GET'])
def list_jobs():
    try:
        jobs = []
        for job_id, status in job_status.items():
            job_info = {
                'job_id': job_id,
                'status': status
            }
            
            if job_id in job_results:
                job_info.update(job_results[job_id])
            
            jobs.append(job_info)
        
        return jsonify({'jobs': jobs}), 200
        
    except Exception as e:
        logger.error(f"Failed to list jobs: {str(e)}")
        return jsonify({'error': 'Failed to list jobs'}), 500
    

if __name__ == '__main__':
    logger.info("Pre-loading Spleeter separator...")
    get_separator()
    logger.info("Spleeter separator pre-loaded successfully")

    if SPLEETER_KEY == 'your_spleeter_key_here':
        logger.warning("Using default Spleeter key, please set SPLEETER_SERVER_KEY environment variable for production use.")

    logger.info(f"""
                    Configuration:
                
                    SPLEETER_URL: {MY_URL}
                    CALLBACK_URL: {CALLBACK_URL}
                    KEY: {SPLEETER_KEY}
                
                """)
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)