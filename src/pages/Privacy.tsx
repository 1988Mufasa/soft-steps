import { Link } from 'react-router-dom'
import { GatedExternalLink } from '../components/GatedExternalLink'

/**
 * Store-facing privacy copy for TestFlight / Play Internal / App Store review.
 * Device-local by design — no child accounts, no in-app purchases.
 */
export function Privacy() {
  return (
    <section className="care-page privacy-page">
      <header className="activity-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <div className="activity-meta">
          <p className="eyebrow">Soft Steps</p>
          <h1>Privacy</h1>
        </div>
      </header>

      <article className="privacy-block">
        <h2>Who Soft Steps is for</h2>
        <p>
          Soft Steps is a calm learning and care app for children (roughly ages 3–12) and the
          grown-ups who support them. Practice games, routines, AAC Talk, check-ins, and social
          stories run on the device — no child account required.
        </p>
      </article>

      <article className="privacy-block">
        <h2>What we store on the device</h2>
        <ul>
          <li>Parent PIN (salted hash only — never plain digits)</li>
          <li>Kid profiles, age band, favorites, and practice progress</li>
          <li>Routines, AAC phrases, custom photos, and social stories you add</li>
          <li>Optional check-in history and sensory / accessibility prefs</li>
        </ul>
        <p>
          Soft Steps does not create child accounts on our servers and does not collect AAC taps or
          vocabulary use in the cloud. Learning data stays in this browser or app install unless
          you export a backup file yourself.
        </p>
      </article>

      <article className="privacy-block">
        <h2>Camera &amp; microphone</h2>
        <p>
          Camera is used only when a grown-up or caregiver adds a photo (stories, AAC, routines).
          Microphone is used for on-device custom AAC voice clips and speech — Soft Steps does not
          upload audio recordings to Soft Steps servers. Permissions are requested by the OS when
          you tap those features.
        </p>
      </article>

      <article className="privacy-block">
        <h2>Network</h2>
        <p>
          Soft Steps is built to work 100% offline after install — practice games, AAC Talk, routines,
          check-ins, social stories, and learning videos all run on the device. Soft Steps has no
          in-app purchases and does not collect payments. Soft Steps does not sell personal data and
          does not show third-party ads. Soft Steps does not embed YouTube Kids or other external
          video hosts.
        </p>
      </article>

      <article className="privacy-block">
        <h2>No payments</h2>
        <p>
          Soft Steps does not sell subscriptions or one-time purchases inside the app. There is no
          checkout, no Stripe, and no card entry of any kind.
        </p>
      </article>

      <article className="privacy-block">
        <h2>Backups</h2>
        <p>
          Grown-ups can export an AES‑GCM encrypted backup (settings, AAC, photos, progress) locked
          with the device PIN. PIN hashes are not stored inside the file. You choose where to keep
          that file (device Files, iCloud Drive, Google Drive, etc.). Soft Steps does not
          automatically sync to the cloud yet.
        </p>
      </article>

      <article className="privacy-block">
        <h2>Grown-up unlock</h2>
        <p>
          Parent settings require a PIN (salted PBKDF2). Unlock sessions expire after 15 minutes or
          5 minutes of idle time. Repeated wrong PINs lock out with increasing delays.
        </p>
      </article>

      <article className="privacy-block">
        <h2>Accessibility</h2>
        <p>
          Soft Steps supports VoiceOver / TalkBack with skip links, focus outlines, and page
          announcements. Grown-ups can enable reduced motion (including follow system Reduce
          Motion), sensory-friendly soft audio, and Quiet mode.
        </p>
      </article>

      <article className="privacy-block">
        <h2>Contact &amp; support</h2>
        <p>
          Questions about privacy: use the contact email listed with your App Store / Play listing
          when Soft Steps is published. Project feedback opens behind a grown-up check.
        </p>
        <GatedExternalLink href="https://github.com/1988Mufasa/soft-steps/issues">
          Support / feedback
        </GatedExternalLink>
      </article>
    </section>
  )
}
