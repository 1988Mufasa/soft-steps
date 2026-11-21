# Soft Steps

**Soft Steps is a native-capable AAC communication app** for kids ages 3–12 (autism-friendly).  
It ships as:

1. **iOS / Android app** via Capacitor (`ios/` + `android/`, app id `com.softsteps.learn`)
2. **Home Screen app** (PWA install / Add to Home Screen) for full-screen offline use
3. A browser preview only for development — not the intended kid experience

## Run as an app (recommended)

### On your Mac (real device / simulator)

```bash
cd soft-steps
npm install

# Rebuild web UI into the native shells
npm run mobile:sync

# iPhone / iPad — opens Xcode
npm run mobile:ios

# Android — opens Android Studio
npm run mobile:android
```

Then press **Run** in Xcode or Android Studio onto a simulator or USB device.  
That launches Soft Steps as a real app (splash screen, status bar, no browser chrome).

### Home Screen install (no App Store yet)

1. Open Soft Steps once in Safari (iOS) or Chrome (Android).
2. **Share → Add to Home Screen** (iOS) or **Install app** (Android).
3. Open from the home icon — full-screen, offline AAC board.

Default parent PIN: **1234**

## Browser preview (dev only)

```bash
npm install
npm run build
npm run preview
# → http://127.0.0.1:4173/
```

Kids should not stay in a browser tab. Use Home Screen install or the native project.

## What this environment can / cannot do

| Path | Cloud VM | Your Mac |
|------|----------|----------|
| Vite build + preview | ✅ | ✅ |
| `npm run mobile:sync` | ✅ | ✅ |
| Open Xcode / iOS Simulator | ❌ | ✅ |
| Open Android Studio / emulator | ❌ | ✅ |
| TestFlight / Play upload | ❌ | ✅ (signing) |

## Offline (100%)

After install / first load, Soft Steps works without Wi‑Fi: Talk AAC, Learn games, routines, check-ins, stories, videos, and extras. Progress stays on the device.

## Stack

React + Vite + TypeScript + vite-plugin-pwa + Capacitor 8
