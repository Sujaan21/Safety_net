# 🛡️ SafetyNet — Personal Safety Sentinel

> **"Your AI-powered personal safety companion — always watching, always ready."**

---

## 📖 About

**SafetyNet** is a fully functional, zero-backend, client-side Progressive Web Application (PWA) designed for real-time personal safety and emergency response. 

Built for the **PromptWars x GDGoC MM(DU)** hackathon under the **"SafetyNet"** challenge theme, SafetyNet combines modern browser APIs, high-precision GPS geolocation, Web Audio acoustic alarms, and Google Gemini 2.0 Flash AI into a mobile-first, dark glassmorphism interface that works reliably anywhere — even offline.

---

## ✨ Features

- 🚨 **SOS Panic Button** — Hold-to-trigger with instant GPS capture, pre-formatted emergency WhatsApp & SMS dispatch, screen strobe visual signaling, vibration, and loud dual-tone siren.
- ⏱️ **Safety Check-In Timer** — Configurable countdown with audio/visual monitoring; automatically triggers escalation alarms and broadcasts live coordinates to emergency contacts if you fail to check in.
- 🗺️ **Live Location Map** — Real-time GPS tracking on Leaflet/OpenStreetMap with breadcrumb trail, reverse-geocoded street addresses, and 1-tap quick search for nearby police stations, hospitals, and 24/7 pharmacies.
- 🤖 **AI Safety Chat** — Google Gemini 2.0 Flash conversational integration paired with an instant offline safety rule engine for life-saving protocols (CPR steps, severe bleeding control, de-escalation tactics, burns, choking/Heimlich, earthquake, and rideshare safety).
- 📋 **Emergency Medical ID** — Store vital medical information (blood group, allergies, medications, emergency notes, multiple contacts) locally and generate a scannable QR code for first responders to scan directly from a locked screen.
- 🔊 **Emergency Siren** — Web Audio API dual-tone siren (500Hz–1200Hz wail) with high-visibility red/white screen strobe and SOS vibration pattern.
- 📱 **PWA & Offline First** — Installable directly on iOS and Android phones with full offline asset caching via Service Worker.
- 💾 **Data Backup** — Export and import all contacts, medical records, and custom settings as JSON with zero server footprint.

---

## 🛠️ Tech Stack

- **Core / Bundler**: [Vite](https://vitejs.dev/) + Vanilla JavaScript (Modern ES Modules)
- **Styling**: Tailwind CSS (CDN) + Custom Glassmorphic Dark UI
- **Mapping & Geolocation**: [Leaflet.js](https://leafletjs.com/) + OpenStreetMap CartoDB Tiles + Geolocation API
- **First Responder QR**: [qrcode](https://www.npmjs.com/package/qrcode)
- **AI Intelligence**: Google Gemini 2.0 Flash API (`gemini-2.0-flash`) + Offline Emergency Fallback Engine
- **Audio & Haptics**: Web Audio API (dual-oscillator siren synthesis) + Web Speech API + Vibration API
- **Persistence & Offline**: `localStorage` + Service Worker (`sw.js`) + Web App Manifest (`manifest.json`)
- **Cloud Deployment**: Containerized with multi-stage Docker & Nginx for Google Cloud Run / Google App Engine / Firebase Hosting

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone & Install
```bash
# Navigate to the project directory
cd safetynet

# Install dependencies
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` (or scan your local network IP on mobile).

### 3. Build for Production
```bash
npm run build
```
The optimized bundle is generated into the `dist/` directory (under 300 KB total size).

---

## ☁️ Google Cloud Deployment

SafetyNet is production-ready for Google Cloud Platform:

### Google Cloud Run (1-Command Deploy)
```bash
gcloud run deploy safetynet --source . --region us-central1 --allow-unauthenticated
```

### Firebase Hosting
```bash
npm run deploy:firebase
```

---

## 📄 License
MIT License. Built for the PromptWars x GDGoC MM(DU) Hackathon.