/** Apply baseline browser hardening hints at runtime (complements server headers). */

export function applyClientSecurityHints() {
  // Block accidental embedding of Soft Steps in hostile iframes when headers missing.
  try {
    if (window.top && window.top !== window.self) {
      // Allow same-origin embeds only (Capacitor / PWA shells).
      if (window.top.location.origin !== window.location.origin) {
        document.body.innerHTML = ''
      }
    }
  } catch {
    // Cross-origin frame access throws — treat as hostile embed.
    document.body.innerHTML = ''
  }
}
