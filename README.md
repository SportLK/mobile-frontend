# SportLK Mobile Application (Expo SDK 58)

The official player and community mobile client for the SportLK platform, built with **Expo SDK 58**, **Expo Router**, **React Native**, and **TypeScript**.

---

## Features (Member 1 Scope)

- **Authentication & Security**: Email/password registration, login, role selection, and encrypted token storage using `expo-secure-store`.
- **Player Profiles & Sports Preferences**: User bio, multi-sport selection, skill levels, and preferred positions.
- **Community Feed & Interactions**: Real-time sports community posts, interactive likes, threaded comments, and content reporting.
- **Role Applications**: In-app application workflow to apply for **Team Manager** or **Tournament Organizer** roles.
- **Multi-Role Workspace Switching**: Dynamic navigation workspace switching based on approved user roles.
- **Notifications**: In-app notifications feed with unread indicators and category badges.

---

## Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- [Expo Go](https://expo.dev/go) app on your mobile device (iOS / Android) or an Android Emulator / iOS Simulator.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```env
# Android emulator connects via 10.0.2.2
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1

# For physical phone testing on the same Wi-Fi, use your computer's local IP:
# EXPO_PUBLIC_API_URL=http://192.168.1.X:3000/api/v1
```

### 4. Run Development Server
```bash
npx expo start
```
- **Physical Phone**: Scan the QR code shown in the terminal with Expo Go.
- **Android Emulator**: Press `a`.
- **iOS Simulator**: Press `i`.
- **Web Preview**: Press `w`.

---

## Multi-Member Integration

For complete architecture, database entity relationships, and backend integration contracts across all 4 team members, refer to [TEAM_INTEGRATION_GUIDE.md](./TEAM_INTEGRATION_GUIDE.md).
