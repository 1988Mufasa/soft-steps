# Soft Steps — store packaging (TestFlight / Play Internal)

## App identity
- **Name:** Soft Steps  
- **Short:** Soft Steps  
- **Category:** Education / Kids  
- **Age:** 3–12 (grown-up gated controls)

## Icons & splash
- PWA / web: `public/icons/icon-192.png`, `icon-512.png`, `favicon.svg`  
- Capacitor Android / iOS splash assets under `android/.../splash.png` and `ios/.../Splash.imageset`  
- Theme color `#3661B0`, background `#F7F7F2`

## Privacy URL (in-app)
- Route: `/privacy`  
- Copy covers on-device storage, camera/mic, offline-first, Stripe Checkout, backup files  
- Link also from Grown-ups → Security & payments

## Permissions checklist (real device)
1. Install via **Add to Home Screen** (or TestFlight / internal APK)  
2. Open from the home icon (not Safari tab)  
3. Tap install banner **Check camera & mic** or add a story photo  
4. Confirm OS prompts; Soft Steps does not upload media to Soft Steps servers  

## Store listing blurbs (draft)
**Subtitle:** Calm autism-friendly learning offline  

**Description (short):** Soft Steps helps kids practice ABCs, signs, foods, routines, AAC check-ins, and social stories with sensory-friendly controls. Most tools work offline. Grown-ups unlock settings with a PIN.

**Keywords:** autism, AAC, social stories, first then, calm, offline learning, ASL practice

## Build notes
- Web PWA: `npm run build`  
- Native shell: Capacitor project already present (`ios/`, `android/`)  
- Purchases require Wi‑Fi (Stripe Checkout only)
