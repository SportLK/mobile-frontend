# 📱 SportLK Mobile App

<p align="center">
  <strong>Discover events, build teams, and stay connected to sport in Sri Lanka.</strong>
</p>

SportLK is a cross-platform mobile app for players, team managers, and event organizers. This repository contains the React Native client; the planned service layer is the NestJS API backed by MySQL.

## 🧰 Technology

| Layer | Technology |
| --- | --- |
| Mobile app | React Native 0.87 · TypeScript |
| API | [NestJS backend](https://github.com/SportLK/backend) |
| Database | MySQL, accessed by the backend |

The mobile app communicates with the backend API. It does not connect to MySQL directly.

## ✨ Planned app workflows

- **Players:** find events and teams, register for tournaments, view stats, and join the community
- **Team managers:** create teams, manage rosters, invite players, and register for events
- **Organizers:** publish events, create tournaments, schedule matches, and submit results
- **Everyone:** follow scores, rankings, and sports community updates

These workflows describe the project direction. The app is currently a React Native CLI starter scaffold, and SportLK screens and API integration are still to be built.

## 🚀 Run the app

### Requirements

- Node.js 22.11 or later
- Android Studio and an Android emulator or device for Android development
- macOS, Xcode, and CocoaPods for iOS development

Install JavaScript dependencies:

```bash
npm ci
```

Start Metro in one terminal:

```bash
npm start
```

Run the app from another terminal:

```bash
# Android
npm run android

# iOS (macOS only)
bundle install
bundle exec pod install
npm run ios
```

For platform-specific setup, follow the [React Native environment setup guide](https://reactnative.dev/docs/set-up-your-environment).

## 🧪 Available scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Metro development server |
| `npm run android` | Build and launch on Android |
| `npm run ios` | Build and launch on iOS |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |

## 🔗 SportLK repositories

- [Backend API](https://github.com/SportLK/backend)
- [Mobile app](https://github.com/SportLK/mobile-frontend)
- [Admin website](https://github.com/SportLK/web-admin-frontend)
