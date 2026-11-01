# 📱 SportLK Mobile App

<p align="center">
  <strong>Discover events, build teams, and stay connected to sport in Sri Lanka.</strong>
</p>

SportLK is a cross-platform app for players, team managers, and event organizers. This repository contains the Expo and React Native client, which connects to the SportLK backend API.

## 🧰 Technology

| Layer | Technology |
| --- | --- |
| Mobile app | Expo SDK 58 · React Native · TypeScript · Expo Router |
| Live updates | Socket.IO client |
| API service | [NestJS backend](https://github.com/SportLK/backend) |
| Database | MySQL, accessed by the backend |

The mobile app communicates with the backend API. It does not connect to MySQL directly.

## ✨ App capabilities

- Register, sign in, and store session tokens securely
- Manage player profiles, sports preferences, and role applications
- Browse community posts, interact with members, and receive notifications
- View matches, live scores, statistics, venues, and venue details

## 🚀 Run locally

### Requirements

- Node.js and npm
- Expo Go or an Android emulator / iOS simulator
- For iOS simulator builds, macOS with Xcode

Install dependencies:

```bash
npm ci
```

Set `EXPO_PUBLIC_API_URL` in `.env` to the backend URL. For an Android emulator, use `http://10.0.2.2:3000/api/v1`; for a physical device, use your computer's local network address.

Start Expo:

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android, `i` for iOS, or `w` for the web preview.

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run android` | Start Expo for Android |
| `npm run ios` | Start Expo for iOS |
| `npm run web` | Start the web preview |

## 🔗 SportLK repositories

- [Backend API](https://github.com/SportLK/backend)
- [Mobile app](https://github.com/SportLK/mobile-frontend)
- [Admin website](https://github.com/SportLK/web-admin-frontend)
- [Team integration guide](./TEAM_INTEGRATION_GUIDE.md)
