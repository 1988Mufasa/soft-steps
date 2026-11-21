/**
 * Common AAC word-form popups (tenses / plurals) for press-and-hold.
 * Keeps the main board uncluttered while giving SLPs grammar options.
 */

const FORMS: Record<string, string[]> = {
  want: ['want', 'wants', 'wanted', 'wanting'],
  need: ['need', 'needs', 'needed', 'needing'],
  help: ['help', 'helps', 'helped', 'helping'],
  stop: ['stop', 'stops', 'stopped', 'stopping'],
  go: ['go', 'goes', 'went', 'going'],
  more: ['more'],
  look: ['look', 'looks', 'looked', 'looking'],
  like: ['like', 'likes', 'liked', 'liking'],
  play: ['play', 'plays', 'played', 'playing'],
  eat: ['eat', 'eats', 'ate', 'eating'],
  drink: ['drink', 'drinks', 'drank', 'drinking'],
  wait: ['wait', 'waits', 'waited', 'waiting'],
  listen: ['listen', 'listens', 'listened', 'listening'],
  come: ['come', 'comes', 'came', 'coming'],
  sit: ['sit', 'sits', 'sat', 'sitting'],
  walk: ['walk', 'walks', 'walked', 'walking'],
  read: ['read', 'reads', 'reading'],
  // light noun plurals
  snack: ['snack', 'snacks'],
  friend: ['friend', 'friends'],
}

/** Returns alternate forms for a button id/label, excluding the base if alone. */
export function wordFormsFor(id: string, label: string): string[] {
  const key = id.toLowerCase().replace(/[^a-z]/g, '')
  const fromId = FORMS[key]
  if (fromId?.length) return fromId
  const fromLabel = FORMS[label.toLowerCase().trim()]
  if (fromLabel?.length) return fromLabel
  return []
}
