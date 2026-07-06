# Food Ordering System

A fullstack self-service food ordering system with IoT integration, ESP32 pagers notify customers in real time when their order is ready.

![Main screen](./screens/1_main.jpg)

## Features

- Browse the menu and place orders without an account
- Kitchen panel (real-time, WebSocket) where the cook changes the order status
- ESP32 pager with an OLED display: a buzzer and LED signal that the order is ready
- Account system with roles (admin / cook), the admin approves new cooks
- Admin panel: managing users and products

## Architecture

```
┌─────────────┐     HTTP/WS      ┌──────────────────┐     MongoDB
│  Frontend   │ ◄──────────────► │     Backend      │ ◄──────────►
│  React/Vite │                  │  Express + WS    │
└─────────────┘                  └──────────────────┘
                                          │ WebSocket
                                          ▼
                                 ┌──────────────────┐
                                 │   ESP32 Pager    │
                                 │  OLED + Buzzer   │
                                 └──────────────────┘
```

## Tech stack

| Layer | Technologies |
|---------|-------------|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express, WebSocket (ws) |
| Database | MongoDB, Mongoose |
| Hardware | ESP32, PlatformIO, WebSockets, ArduinoJson |
| Display | OLED SH1106 (ThingPulse) |
| Auth | JWT, bcrypt |

## Screenshots

### Client app

| Menu | Cart |
|------|--------|
| ![Menu](./screens/2_menu.jpg) | ![Cart](./screens/3_basket.jpg) |

### Kitchen panel

![Kitchen](./screens/4_kuchnia.jpg)

### Admin panel

![Admin](./screens/5_admin.jpg)

### ESP32 pager, device states

| Waiting | In progress | Ready! |
|-------------|----------------------|---------|
| ![Waiting](./screens/pager_oczekiwanie.jpg) | ![In progress](./screens/pager_w_trakcie.jpg) | ![Ready](./screens/pager_gotowe.jpg) |

![Device](./screens/pager.jpg)

## Running it

### Requirements
- Node.js 18+
- MongoDB
- (optional) ESP32 with PlatformIO for the pagers

### Backend

```bash
cd backend
cp .env.example .env
# Fill in JWT_SECRET and MONGODB_URI in .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### ESP32 Pager

```bash
cd pager-esp32/src
cp secrets.h.example secrets.h
# Fill in WIFI_SSID, WIFI_PASSWORD and BACKEND_IP in secrets.h
# Upload via PlatformIO
```

## Project structure

```
food-ordering-system/
├── backend/          # Express API + WebSocket server
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       └── services/
├── frontend/         # React SPA
│   └── src/
│       ├── pages/
│       ├── context/
│       └── services/
├── pager-esp32/      # ESP32 firmware (PlatformIO)
│   └── src/
│       └── main.cpp
├── docs/             # Documentation, diagrams, ERD
└── screens/          # Screenshots and device photos
```

## Author

Filip, Intelligent Systems Engineering student, 3rd year  
[GitHub](https://github.com/wojtas-it)

## More

Portfolio: [wojtas.it](https://wojtas.it)
