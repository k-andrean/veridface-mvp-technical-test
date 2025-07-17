from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import face_recognition
import numpy as np
import base64
from cryptography.fernet import Fernet
import requests
import datetime
from dotenv import load_dotenv
import os
import io
from PIL import Image
import random

# Load .env
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:8080",
    "https://localhost:8080",
    "https://192.168.68.98:8080",
    "https://192.168.68.98:8081",
    "https://40d6-119-160-190-151.ngrok-free.app"
]}}, supports_credentials=True)

# Airtable configs
AIRTABLE_PAT = os.getenv("AIRTABLE_PAT")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
AIRTABLE_TABLE_NAME = os.getenv("AIRTABLE_TABLE_NAME")               # Registration table
AIRTABLE_LOGS_TABLE_NAME = os.getenv("AIRTABLE_LOGS_TABLE_NAME")     # Logs table

# Encryption
if not os.path.exists("secret.key"):
    with open("secret.key", "wb") as f:
        f.write(Fernet.generate_key())

with open("secret.key", "rb") as f:
    encryption_key = f.read()

cipher = Fernet(encryption_key)

# Helper functions
def decode_base64_image(base64_str):
    img_data = base64.b64decode(base64_str.split(',')[1])
    img = Image.open(io.BytesIO(img_data))
    return np.array(img)

def generate_digital_id():
    return f"BIL-{random.randint(1000, 9999)}"

def save_to_airtable(fields, log_table=False):
    table = AIRTABLE_LOGS_TABLE_NAME if log_table else AIRTABLE_TABLE_NAME
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{table}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_PAT}",
        "Content-Type": "application/json"
    }
    data = {"fields": fields}
    res = requests.post(url, headers=headers, json=data)
    print("📥 Airtable Response:", res.status_code, res.text)
    return res.json()

# Register endpoint
@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        image_np = decode_base64_image(data['image'])
        encodings = face_recognition.face_encodings(image_np)

        if not encodings:
            return jsonify({"status": "fail", "message": "No face detected"}), 400

        encrypted_encoding = cipher.encrypt(encodings[0].tobytes()).decode()
        digital_id = generate_digital_id()

        fields = {
            "Name": data['name'],
            "Email": data['email'],
            "Phone": data['phone'],
            "DigitalID": digital_id,
            "FaceEncoding": encrypted_encoding,
            "Timestamp": str(datetime.datetime.now())
        }

        response = save_to_airtable(fields)
        return jsonify({"status": "success", "digital_id": digital_id, "airtable_response": response})

    except Exception as e:
        print("❌ Registration error:", e)
        return jsonify({"status": "fail", "message": str(e)}), 500

# Face scanner endpoint
@app.route('/facescanner', methods=['POST', 'OPTIONS'])
def scan_face():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response, 200

    try:
        data = request.get_json()
        incoming_image = decode_base64_image(data['image'])

        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
        headers = {"Authorization": f"Bearer {AIRTABLE_PAT}"}
        records = requests.get(url, headers=headers).json().get('records', [])

        print(f"🔍 Comparing against {len(records)} users")
        unknown_encoding = face_recognition.face_encodings(incoming_image)[0]

        for record in records:
            encrypted = record['fields'].get('FaceEncoding')
            if not encrypted:
                continue

            decrypted_bytes = cipher.decrypt(encrypted.encode())
            known_encoding = np.frombuffer(decrypted_bytes, dtype=np.float64)

            match_result = face_recognition.compare_faces([known_encoding], unknown_encoding, tolerance=0.45)[0]
            if match_result:
                confidence = 1 - face_recognition.face_distance([known_encoding], unknown_encoding)[0]

                log_fields = {
                    "user_id": record['fields'].get("DigitalID"),
                    "venue": data.get('venue', 'Unknown Venue'),
                    "timestamp": str(datetime.datetime.now()),
                    "confidence_score": round(confidence, 3)
                }

                save_to_airtable(log_fields, log_table=True)
                response = jsonify({"status": "success", "match": True, "user_id": log_fields["user_id"], "confidence": confidence})
                response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
                return response

        response = jsonify({"status": "fail", "match": False, "message": "No match found"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        return response, 404

    except Exception as e:
        print("❌ Scan error:", e)
        response = jsonify({"status": "fail", "message": str(e)})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        return response, 500

# HTTPS for mobile testing
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        ssl_context=("../certs/192.168.68.98.pem", "../certs/192.168.68.98-key.pem")
    )
