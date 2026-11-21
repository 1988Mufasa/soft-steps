# Soft Steps

Calm ABC, shapes, colors, and numbers practice for kids ages 3–12 (autism-friendly UX).

Works as a **PWA** and as a **Capacitor** native shell (Android + iOS projects included).

## Web / PWA (works in this cloud VM)

```bash
npm install
npm run build
npm run preview
# → http://127.0.0.1:4173/
```

Dev server:

```bash
npm run dev
```

### Add to Home Screen (phone)

1. Open the deployed or LAN preview URL in **Safari (iOS)** or **Chrome (Android)**.
2. Use **Share → Add to Home Screen** (iOS) or **Install app / Add to Home screen** (Android).
3. Soft Steps opens full-screen; offline modules work after the first visit.

Default parent PIN: **1234**

## Capacitor native shells

Projects live in `android/` and `ios/` (`appId`: `com.softsteps.learn`).

```bash
# Rebuild web assets and copy into native projects
npm run mobile:sync

# Open in Android Studio (requires Android SDK + Studio on your machine)
npm run mobile:android

# Open in Xcode (requires macOS + Xcode)
npm run mobile:ios
```

### Live reload on a device/emulator

```bash
# Terminal 1 — expose Vite on your LAN
npm run dev -- --host 0.0.0.0 --port 5173

# Terminal 2 — point Capacitor at that server (example)
npx cap run android -l --host 192.168.1.10 --port 5173
```

Or temporarily set `server.url` in `capacitor.config.ts` while iterating, then remove it before release builds.

### What this Linux cloud VM can / cannot do

| Path | In this VM |
|------|------------|
| Vite build + PWA preview | ✅ |
| `npx cap add/sync` Android + iOS project files | ✅ |
| Android APK via Gradle | ❌ needs Android SDK / Android Studio |
| iOS IPA / Simulator | ❌ needs macOS + Xcode |
| Store submission | ❌ local machine / CI with signing |

## Offline (100%)

After install / first load, Soft Steps works without Wi‑Fi: ABCs, Shapes, Colors, Numbers, Signs,
Foods, Care tools, AAC Talk, Learning videos, and Extra games (Mix quiz, Gentle timer, Multi-step
match). Progress stays on the device — no cloud sync.

## Stack

React + Vite + TypeScript + vite-plugin-pwa + Capacitor 8
