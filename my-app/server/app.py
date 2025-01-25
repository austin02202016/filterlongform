from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import subprocess
from datetime import datetime
from io import BytesIO
import zipfile
import shutil
from filter_chunks import filter_chunks  # Import the filtering function

app = Flask(__name__)
CORS(app)  # Enable CORS

# Define folder paths
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Path to your chunking script
CHUNK_SCRIPT_PATH = r'C:\Users\akenn\OneDrive\Desktop\Coding\apps\personal_content_machine\my-app\server\chunk_transcript.py'

def clear_folder(folder):
    """Remove all files inside the given folder."""
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

@app.route('/')
def home():
    return 'Hello, World!'

@app.route('/upload', methods=['POST'])
def upload_file():
    print("Received upload request")

    if 'contentFile' not in request.files:
        print("Missing content file")
        return jsonify({"error": "Content file is required"}), 400

    content_file = request.files['contentFile']

    if content_file.filename == '':
        print("No selected file")
        return jsonify({"error": "No selected file"}), 400

    # Clear previous files
    clear_folder(UPLOAD_FOLDER)
    clear_folder(OUTPUT_FOLDER)

    try:
        # Save the uploaded content file with a timestamp to avoid overwriting
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        content_filename = f"{timestamp}_{content_file.filename.replace(' ', '_')}"
        content_file_path = os.path.join(UPLOAD_FOLDER, content_filename)
        content_file.save(content_file_path)
        print(f"Content file saved at: {content_file_path}")

        # Run the chunking script
        command = [
            'python', os.path.abspath(CHUNK_SCRIPT_PATH),
            '--file', os.path.abspath(content_file_path),
            '--method', 'semantic'
        ]

        print("Running command:", " ".join(command))

        result = subprocess.run(command, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"Chunking script error: {result.stderr}")
            return jsonify({"error": "Error in chunking process", "details": result.stderr}), 500

        print("Chunking completed successfully. Output:\n", result.stdout)

        # Parse the script output into chunks
        chunk_lines = result.stdout.strip().split("\n")
        chunks = []
        current_chunk = []

        for line in chunk_lines:
            if line.startswith("[CHUNK"):
                if current_chunk:
                    chunks.append(" ".join(current_chunk))
                    current_chunk = []
            else:
                current_chunk.append(line.strip())

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        print(f"Total chunks created: {len(chunks)}")

        if not chunks:
            print("No chunks were generated.")
            return jsonify({"error": "No content generated from the transcript"}), 500

        # Apply the filtering logic to remove irrelevant chunks
        filtered_chunks = filter_chunks(chunks)
        print(f"Total filtered chunks: {len(filtered_chunks)}")

        if not filtered_chunks:
            return jsonify({"error": "No meaningful content found after filtering."}), 400

        # Save filtered chunks as .txt files and create a ZIP archive
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for idx, chunk in enumerate(filtered_chunks):
                chunk_filename = f"filtered_chunk_{idx + 1}.txt"
                chunk_content = chunk.encode('utf-8')
                print(f"Adding to ZIP: {chunk_filename} - Content Length: {len(chunk_content)}")
                zip_file.writestr(chunk_filename, chunk_content)

        # Save the ZIP file locally for debugging
        zip_file_path = os.path.join(OUTPUT_FOLDER, 'debug_filtered_chunks.zip')
        with open(zip_file_path, 'wb') as f:
            f.write(zip_buffer.getvalue())
        
        print(f"ZIP file saved locally at: {zip_file_path}")
        print(f"Local ZIP file size: {os.path.getsize(zip_file_path)} bytes")

        zip_buffer.seek(0)

        # Check the ZIP file size
        zip_size = len(zip_buffer.getvalue())
        print(f"ZIP file size in memory: {zip_size} bytes")

        # Cleanup uploaded files
        os.remove(content_file_path)
        print(f"Deleted uploaded file: {content_file_path}")

        print("Filtered chunks saved and zipped successfully")

        response = send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='filtered_chunks.zip'
        )

        # Additional headers to ensure proper download handling
        response.headers['Content-Length'] = str(len(zip_buffer.getvalue()))
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'

        print(f"Sending ZIP file of size: {len(zip_buffer.getvalue())} bytes to client")

        return response

    except Exception as e:
        print(f"Error processing chunking: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
