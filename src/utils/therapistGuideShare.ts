/** Plain-text Soft Steps guide for SLPs / educators (Share API / clipboard). */

export const SOFT_STEPS_APP_LINK = 'https://github.com/1988Mufasa/soft-steps'

export function buildTherapistEducatorGuideText(): string {
  return [
    'Soft Steps — Built for Clinics, Classrooms & Home',
    '',
    'Soft Steps combines customizable AAC communication, emotional check-ins, ASL, and sensory-friendly learning games for ages 3–12.',
    '',
    '• 100% Offline & COPPA-Safe',
    '  Zero internet required, no accounts, no ads, no AI, and zero cloud tracking.',
    '',
    '• Motor Planning Protection (Mask Mode)',
    '  Hide or reveal buttons on 2×2, 3×4, or 4×6 grids without shifting word positions, with Fitzgerald Key color coding.',
    '',
    '• Classroom & Sensory Controls',
    '  Repeat Tap Cooldown (anti-stimming debounce), Touch Hold Delay, and a collapsible First–Then visual schedule bar.',
    '',
    '• Child-Safe Screen Lock',
    '  Built-in Parental Gate plus step-by-step iPad Guided Access support to keep kids safely in their communication board.',
    '',
    `App / project: ${SOFT_STEPS_APP_LINK}`,
    '',
    'Shared from Soft Steps Parent Controls — for therapists, educators, and caregivers.',
  ].join('\n')
}
