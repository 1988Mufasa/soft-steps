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
- Copy covers on-device storage, camera/mic, offline-first, no IAP / no payments, backup files  
- Link also from Grown-ups → Security & privacy

## Permissions checklist (real device)
1. Install via **Add to Home Screen** (or TestFlight / internal APK)  
2. Open from the home icon (not Safari tab)  
3. Tap install banner **Check camera & mic** or add a story photo  
4. Confirm OS prompts; Soft Steps does not upload media to Soft Steps servers  

## Store listing blurbs (draft)
**Subtitle:** Calm autism-friendly learning offline  

**Description (short):** Soft Steps helps kids practice ABCs, signs, foods, routines, AAC communication, and social stories with sensory-friendly controls. Talk AAC works 100% offline — no account, no in-app purchases, no cloud tracking of taps. Grown-ups unlock editing with a PIN.

**Description (long — AAC / COPPA trust angle):** Soft Steps includes a full AAC talk board for non-verbal communicators: fixed button positions for motor planning, core + fringe vocabulary, Fitzgerald Key colors, sentence strip, real photo & voice uploads, and an About Me emergency message. Speech uses on-device text-to-speech (works offline). Soft Steps is 100% offline after install: Talk AAC, practice games, routines, check-ins, social stories, learning videos, and extra games all run on the device. Soft Steps does not create child accounts, does not collect payments, does not send AAC usage to the cloud, and does not embed YouTube Kids — which keeps COPPA compliance simpler for families and schools.

**Keywords:** autism, AAC, non-verbal, social stories, first then, calm, offline learning, ASL practice, COPPA

## Build notes
- Web PWA: `npm run build`  
- Native shell: Capacitor project already present (`ios/`, `android/`)  
- No payment server / Stripe / in-app purchases  
