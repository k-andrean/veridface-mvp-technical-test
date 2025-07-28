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
import pytz
from collections import defaultdict

# Load .env
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:8080",
    "https://localhost:8080",
    "https://localhost:8081",
    "https://192.168.68.98:8080",
    "https://192.168.68.98:8081",
    "https://feasible-dove-simply.ngrok-free.app"
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
            "Email": data['email'].strip().lower(),
            "Phone": data['phone'],
            "DigitalID": digital_id,
            "FaceEncoding": encrypted_encoding,
            "Timestamp": str(datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"))
        }

        response = save_to_airtable(fields)

        log_fields = {
            "user_id": response['id'],
            "venue": data.get('venue', 'Unknown Venue'),
            "event": data.get('event', 'User Registration'),
            "title": "New user registration",
            "timestamp": str(datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")),
            "confidence_score": "100",
        }

        save_to_airtable(log_fields, log_table=True)
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

        if not data or 'email' not in data:
            return jsonify({"status": "fail", "message": "Email is required"}), 400

        if not data or 'event' not in data:
            return jsonify({"status": "fail", "message": "Event is required"}), 400

        incoming_email = data['email'].strip().lower()
        incoming_image = decode_base64_image(data['image'])

        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
        headers = {"Authorization": f"Bearer {AIRTABLE_PAT}"}
        records = requests.get(url, headers=headers, params={"filterByFormula": f"{{email}} = '{incoming_email}'"}).json().get('records', [])

        if not records:
            return jsonify({"status": "fail", "message": "Email not registered"}), 404

        user_id = records[0]['id']

        jakarta_tz = pytz.timezone("Asia/Jakarta")
        now_jakarta = datetime.datetime.now(jakarta_tz)
        today_start = now_jakarta.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(pytz.utc).isoformat().replace("+00:00", "Z")
        today_end = now_jakarta.replace(hour=23, minute=59, second=59, microsecond=999999).astimezone(pytz.utc).isoformat().replace("+00:00", "Z")

        log_table_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_LOGS_TABLE_NAME}"
        log_query = {"filterByFormula": f"AND("f"{{user_id}} = '{user_id}',"f"{{event}} = '{data.get('event', 'Tech Conference')}',"f"IS_AFTER({{timestamp}}, '{today_start}'),"f"IS_BEFORE({{timestamp}}, '{today_end}')"f")"}
        log_res = requests.get(log_table_url, headers=headers, params=log_query).json()
        already_logged = log_res.get("records", [])

        if already_logged:
            return jsonify({"status": "success", "message": "You have already checked in today", "match": True, "user_id": already_logged[0]["fields"].get("user_id"), "event": already_logged[0]["fields"].get("event"), "confidence": already_logged[0]["fields"].get("confidence_score")}), 200

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
                    "user_id": record['id'],
                    "venue": data.get('venue', 'Unknown Venue'),
                    "event": data.get('event', 'Tech Conference'),
                    "title": f"User ({record['fields'].get('Name')}) Have Scan Attendance To Event ({data.get('event', 'Tech Conference')})",
                    "timestamp": str(datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")),
                    "confidence_score": f"{round(confidence, 3)}",
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

headers = {
    "Authorization": f"Bearer {AIRTABLE_PAT}",
    "Content-Type": "application/json",
}
user_table_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
log_table_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_LOGS_TABLE_NAME}"

@app.route("/dashboard", methods=["GET"])
def get_dashboard():
    try:
        day_param = request.args.get("days", default=14, type=int)
        if day_param < 0:
            return jsonify({"status": "fail", "message": "Days must be >= 0"}), 400
    except:
        day_param = 14
    event_param = request.args.get("event", default="Tech Conference", type=str)
    jakarta_tz = pytz.timezone("Asia/Jakarta")
    today = datetime.datetime.now(jakarta_tz).date()
    today_start = today.isoformat() + "T00:00:00.000Z"
    today_end = today.isoformat() + "T23:59:59.999Z"
    user_res = requests.get(user_table_url, headers=headers).json()
    user = user_res.get("records", [])
    total_user = len(user)
    log_query = {"filterByFormula": f"AND(IS_AFTER({{timestamp}}, '{today_start}'), IS_BEFORE({{timestamp}}, '{today_end}'), {{event}} = '{event_param}')"}
    log_res = requests.get(log_table_url, headers=headers, params=log_query).json()
    log = log_res.get("records", [])
    user_attended = set()
    user_late = set()
    tolerance_start = datetime.time(7, 45)
    tolerance_end = datetime.time(8, 15)
    for single_log in log:
        field = single_log.get("fields", {})
        user_id = field.get("user_id")
        timestamp = field.get("timestamp")
        if user_id and timestamp:
            try:
                dt = datetime.datetime.fromisoformat(timestamp.replace("Z", "+00:00")).astimezone(jakarta_tz)
                attendance_time = dt.time()
                if tolerance_start <= attendance_time <= tolerance_end:
                    user_attended.add(user_id)
                else:
                    user_late.add(user_id)
            except:
                continue
    total_attendance = len(user_attended)
    total_late = len(user_late)
    total_absence = total_user - total_attendance - total_late
    log_latest_query = {"sort[0][field]": "timestamp", "sort[0][direction]": "desc", "pageSize": 10}
    latest_log_res = requests.get(log_table_url, headers=headers, params=log_latest_query).json()
    latest_log = latest_log_res.get("records", [])
    log_all_res = requests.get(log_table_url, headers=headers, params={"filterByFormula": f"AND({{event}} = '{event_param}')"}).json()
    log_all = log_all_res.get("records", [])
    attendance_per_day = defaultdict(set)
    attendance_per_hour = defaultdict(lambda: defaultdict(int))
    for single_log in log_all:
        field = single_log.get("fields", {})
        timestamp = field.get("timestamp")
        user_id = field.get("user_id")
        if timestamp and user_id:
            try:
                dt = datetime.datetime.fromisoformat(timestamp.replace("Z", "+00:00")).astimezone(jakarta_tz)
                date_only = dt.date().isoformat() # date_only = timestamp[:10]
                hour = dt.hour
                attendance_per_day[date_only].add(user_id)
                attendance_per_hour[date_only][hour] += 1
            except Exception as e:
                continue
    daily_attendance = [{"date": date, "count": len(user_id)} for date, user_id in sorted(attendance_per_day.items(), reverse=True)]
    attendance_heatmap = []
    if day_param == 0:
        for date_key, hour_value in sorted(attendance_per_hour.items(), reverse=True):
            for hour_key, count_value in sorted(hour_value.items()):
                attendance_heatmap.append({
                    "date": date_key,
                    "hour": hour_key,
                    "count": count_value,
                })
    else:
        date_range = [(today - datetime.timedelta(days=i)).isoformat() for i in range(day_param)][::-1]
        for date_str in date_range:
            for hour in range(24):
                count = attendance_per_hour[date_str][hour] if hour in attendance_per_hour.get(date_str, {}) else 0
                attendance_heatmap.append({
                    "date": date_str,
                    "hour": hour,
                    "count": count,
                })
    return jsonify(
        {
            "status": "success",
            "data": {
                "total_user": total_user,
                "total_attendance_today": total_attendance,
                "total_late_today": total_late,
                "total_absence_today": total_absence,
                "latest_log": latest_log,
                "daily_attendance": daily_attendance,
                "hourly_attendance": attendance_heatmap,
            },
        },
    )

@app.route("/users", methods=["GET"])
def get_all_user():
    params = []
    search_value = request.args.get("search")
    for key, value in request.args.items():
        if key != "search":
            formula = f"{{{key}}}='{value}'"
            params.append(formula)
    search_formula = ""
    if search_value:
        searchable_fields = ["Name", "Email", "Phone", "DigitalID"]
        or_conditions = [f"FIND(LOWER('{search_value}'), LOWER({{{field}}}))" for field in searchable_fields]
        search_formula = "OR(" + ",".join(or_conditions) + ")"
    all_conditions = []
    if params:
        all_conditions.append("AND(" + ",".join(params) + ")" if len(params) > 1 else params[0])
    if search_formula:
        all_conditions.append(search_formula)
    query = {}
    if all_conditions:
        query["filterByFormula"] = "AND(" + ",".join(all_conditions) + ")" if len(all_conditions) > 1 else all_conditions[0]
    query["sort[0][field]"] = "Timestamp"
    query["sort[0][direction]"] = "desc"
    res = requests.get(user_table_url, headers=headers, params=query).json()
    return jsonify({"status": "success", "data": res.get("records", [])})

@app.route("/users/<record_id>", methods=["GET"])
def get_single_user(record_id):
    res = requests.get(f"{user_table_url}/{record_id}", headers=headers)
    if res.status_code == 404:
        return jsonify({"status": "fail", "message": "Data not found"}), 404
    user = res.json()
    log_query = {
        "filterByFormula": f"{{user_id}}='{record_id}'",
        "sort[0][field]": "timestamp",
        "sort[0][direction]": "desc",
    }
    log_res = requests.get(log_table_url, headers=headers, params=log_query).json()
    log = log_res.get("records", [])
    user["log"] = log
    return jsonify({"status": "success", "data": user})

@app.route("/users/<record_id>", methods=["PUT"])
def update_user(record_id):
    res = requests.put(f"{user_table_url}/{record_id}", json={"fields": request.json}, headers=headers)
    if res.status_code == 404:
        return jsonify({"status": "fail", "message": "Data not found"}), 404
    return jsonify({"status": "success", "data": res.json()})

@app.route("/users/<record_id>", methods=["DELETE"])
def delete_user(record_id):
    get_res = requests.get(f"{user_table_url}/{record_id}", headers=headers)
    if get_res.status_code == 404:
        return jsonify({"status": "fail", "message": "Data not found"}), 404
    record_data = get_res.json()
    del_res = requests.delete(f"{user_table_url}/{record_id}", headers=headers)
    if del_res.status_code == 200:
        return jsonify({"status": "success", "data": record_data})
    else:
        return jsonify({"status": "fail", "message": "Failed to delete data"}), del_res.status_code

@app.route("/logs", methods=["GET"])
def get_all_log():
    params = []
    search_value = request.args.get("search")
    for key, value in request.args.items():
        if key != "search":
            formula = f"{{{key}}}='{value}'"
            params.append(formula)
    search_formula = ""
    if search_value:
        searchable_fields = ["user_id", "vanue", "confidence_score"]
        or_conditions = [f"FIND(LOWER('{search_value}'), LOWER({{{field}}}))" for field in searchable_fields]
        search_formula = "OR(" + ",".join(or_conditions) + ")"
    all_conditions = []
    if params:
        all_conditions.append("AND(" + ",".join(params) + ")" if len(params) > 1 else params[0])
    if search_formula:
        all_conditions.append(search_formula)
    query = {}
    if all_conditions:
        query["filterByFormula"] = "AND(" + ",".join(all_conditions) + ")" if len(all_conditions) > 1 else all_conditions[0]
    query["sort[0][field]"] = "timestamp"
    query["sort[0][direction]"] = "desc"
    res = requests.get(log_table_url, headers=headers, params=query).json()
    return jsonify({"status": "success", "data": res.get("records", [])})

@app.route("/logs/<record_id>", methods=["GET"])
def get_single_log(record_id):
    res = requests.get(f"{log_table_url}/{record_id}", headers=headers)
    if res.status_code == 404:
        return jsonify({"status": "fail", "message": "Data not found"}), 404
    return jsonify({"status": "success", "data": res.json()})

@app.route("/logs/<record_id>", methods=["PUT"])
def update_log(record_id):
    res = requests.put(f"{log_table_url}/{record_id}", json={"fields": request.json}, headers=headers)
    if res.status_code == 404:
        return jsonify({"status": "fail", "message": "Data not found"}), 404
    return jsonify({"status": "success", "data": res.json()})

@app.route("/logs/<record_id>", methods=["DELETE"])
def delete_log(record_id):
    get_res = requests.get(f"{log_table_url}/{record_id}", headers=headers)
    if get_res.status_code == 404:
        return jsonify({"status": "fail", "message": "Data not found"}), 404
    record_data = get_res.json()
    del_res = requests.delete(f"{log_table_url}/{record_id}", headers=headers)
    if del_res.status_code == 200:
        return jsonify({"status": "success", "data": record_data})
    else:
        return jsonify({"status": "fail", "message": "Failed to delete data"}), del_res.status_code

# HTTPS for mobile testing
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=6000,
        ssl_context=("../certs/192.168.68.98.pem", "../certs/192.168.68.98-key.pem")
    )
