# VerIDFace MVP

VerIDFace is a facial verification platform that enables secure face scanning and registration through a web interface. This MVP demonstrates a multi-component architecture with backend services and two separate frontends for registration and face scanning.

---

## 📁 Project Structure

```bash
veridface-mvp/
│
├── backend/                # Flask backend with SSL support
│   └── app.py              # Main application script
│
├── frontend-facescanner/  # React app for face scanning
│
├── frontend-register/     # React app for registration
│
├── certs/                 # SSL certificates for secure localhost testing
└── README.md              # Project instructions and setup
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.x
- Node.js (v14+)
- Git Bash or terminal
- [Ngrok account](https://dashboard.ngrok.com/get-started/setup/windows)

---

## 🔧 Setup Instructions

### 1. Update IP Address

- Open a terminal and run `ipconfig` (Windows) or `ifconfig` (Mac/Linux).
- Find your **IPv4 address** (e.g., `172.20.10.4`).
- In `backend/app.py`, replace all instances of old IPs (e.g., `192.168.68.109`) with your current IP.

Example:
```python
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:8080",
    "https://<your-ip>:8080",
    ...
]}})
```

---

### 2. Start Ngrok Tunnel

```bash
cd certs/
ngrok http https://localhost:5000
```

- Copy the generated `https://<ngrok-id>.ngrok-free.app` link.

---

### 3. Update Ngrok URL

Replace the ngrok URL in:

- `backend/app.py`
- `frontend-facescanner/src/app.tsx`
- `frontend-register/src/components/registration/registrationflow.tsx`
- `frontend-register/src/components/registration/successstep.tsx`

Update IPs in SSL paths if needed.

---

### 4. Run All Components

Open three separate terminals and run:

#### Backend

```bash
cd backend/
python app.py
```

#### Face Scanner Frontend

```bash
cd frontend-facescanner/
npm install
npm run dev
```

#### Registration Frontend

```bash
cd frontend-register/
npm install
npm run dev
```

---

## ✅ Features

- ✅ Live camera face capture
- ✅ Secure HTTPS communication (localhost)
- ✅ Frontend–backend integration via Ngrok tunneling
- ✅ Modular React + Flask architecture

---

## 🛡️ Security Notes

- All communication is routed over HTTPS via self-signed certs and Ngrok.
- CORS policies are manually enforced.
- SSL keys and certificates must be kept secure.

---

## 📎 Useful Links

- Ngrok Setup: [https://dashboard.ngrok.com/get-started/setup/windows](https://dashboard.ngrok.com/get-started/setup/windows)
- Local Backend URL: `https://localhost:5000`
- Ngrok Dashboard: [https://dashboard.ngrok.com](https://dashboard.ngrok.com)

---

## 🧠 Author Notes

This MVP is designed for local development and testing. Future iterations may include:

- User authentication and storage
- Persistent database integration
- Cloud deployment and scalability
