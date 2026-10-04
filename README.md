# 📲 Automated WhatsApp Scheduled Notification Service

A lightweight, self-hosted WhatsApp notification pipeline built with **Node.js (@whiskeysockets/baileys)**, **Express HTTP REST API**, and native **Linux Systemd User Timers**.

Engineered for reliable, cron-less event dispatching (e.g., daily personal healthcare reminders, server alerts, or customer dispatch notifications) without reliance on expensive third-party SMS/WhatsApp Business API gateways.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────┐
│     Linux Systemd Timer         │ (Triggers daily at 07:00 WIB)
│   wa-blood-reminder.timer       │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       Trigger Bash Script       │ (Formats JSON payload & executes curl)
│        send_reminder.sh         │
└────────────────┬────────────────┘
                 │ HTTP POST http://127.0.0.1:3001/send
                 ▼
┌─────────────────────────────────┐
│   Node.js Gateway Microservice  │ (Holds persistent session & manages Baileys socket)
│           server.js             │
└────────────────┬────────────────┘
                 │ End-to-End Encrypted WebSocket
                 ▼
┌─────────────────────────────────┐
│     WhatsApp Web (Meta Core)    │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       Recipient Handset         │
└─────────────────────────────────┘
```

---

## ⚡ Key Highlights

- **Native Pairing Code Authentication:** Eliminates fragile terminal QR code scanning; authenticate remotely using 8-character numeric pairing codes directly from WhatsApp's Linked Devices UI.
- **RESTful Gateway:** Exposes a clean HTTP `POST /send` endpoint accepting `{ number, message }` payloads, decoupling business logic from WhatsApp's low-level WebSocket protocol.
- **Persistent Systemd Execution:** Features `Persistent=true` in systemd timers to guarantee catch-up execution if the server undergoes power interruptions or downtime during scheduled firing windows.
- **Privacy & Security First:** Multi-device session credentials stored strictly on-premise in local encrypted directories with no external cloud telemetry.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18
- Linux Systemd (or Docker)
- An active WhatsApp account on your mobile handset

### 2. Installation
```bash
git clone https://github.com/anggi3285/whatsapp-scheduled-reminder.git
cd whatsapp-scheduled-reminder
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit configuration:
```env
PORT=3001
AUTH_PHONE_NUMBER=628xxxxxxxxxx
AUTH_DIR=./auth_info
```

### 4. Running the Gateway
```bash
npm start
```
1. Open WhatsApp on your handset -> **Linked Devices** -> **Link a Device**.
2. Select **Link with phone number instead**.
3. Input the 8-character pairing code printed by the gateway console.

### 5. Automated Scheduling via Systemd
Copy the provided unit files to your user systemd directory:
```bash
mkdir -p ~/.config/systemd/user/
cp systemd/* ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now wa-blood-reminder.timer
```

Verify timer status:
```bash
systemctl --user list-timers --all | grep reminder
```

---

## 📄 License
MIT License.
