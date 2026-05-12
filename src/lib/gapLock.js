import { GAP_UNLOCK_SHA256_FALLBACK } from '../config/gapLockSecret'

/** CV / gap tracker articles: slug starts with A##-, B##-, D##-, or E##- */
const GAP_SLUG_RE = /^(?:A\d{2}|B\d{2}|D\d{2}|E\d{2})-/

export const GAP_UNLOCK_STORAGE_KEY = 'tech-heart-gap-library-unlocked'
export const GAP_UNLOCK_CHANGED = 'tech-heart:gap-unlock-changed'

export function isGapSlug(slug = '') {
  return GAP_SLUG_RE.test(slug)
}

export function getExpectedGapUnlockHash() {
  const fromEnv = String(import.meta.env.VITE_GAP_UNLOCK_SHA256 || '')
    .trim()
    .toLowerCase()
  if (/^[a-f0-9]{64}$/.test(fromEnv)) return fromEnv
  const fb = String(GAP_UNLOCK_SHA256_FALLBACK || '')
    .trim()
    .toLowerCase()
  if (/^[a-f0-9]{64}$/.test(fb)) return fb
  return ''
}

export function isGapUnlockConfigured() {
  return getExpectedGapUnlockHash() !== ''
}

export function getGapUnlocked() {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(GAP_UNLOCK_STORAGE_KEY) === '1'
}

export function setGapUnlocked() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(GAP_UNLOCK_STORAGE_KEY, '1')
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(GAP_UNLOCK_CHANGED))
  }
}

export function clearGapUnlocked() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(GAP_UNLOCK_STORAGE_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(GAP_UNLOCK_CHANGED))
  }
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

async function sha256HexUtf8(text) {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  const bytes = new Uint8Array(buf)
  let hex = ''
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

/** Passphrase rules: exactly 12 chars, includes at least one digit and one non-letter non-digit symbol. */
export function isValidGapUnlockShape(phrase) {
  if (typeof phrase !== 'string' || phrase.length !== 12) return false
  if (!/^[\x20-\x7E]{12}$/.test(phrase)) return false
  if (!/[0-9]/.test(phrase)) return false
  if (!/[^A-Za-z0-9]/.test(phrase)) return false
  return true
}

export async function verifyGapUnlockPhrase(phrase) {
  const expected = getExpectedGapUnlockHash()
  if (!expected) return false
  if (!isValidGapUnlockShape(phrase)) return false
  const digest = await sha256HexUtf8(phrase)
  return timingSafeEqualHex(digest, expected)
}

export function filterArticlesForHome(allArticles, unlocked) {
  const configured = isGapUnlockConfigured()
  return allArticles.filter((post) => {
    if (!isGapSlug(post.slug)) return true
    if (!configured) return false
    return unlocked
  })
}

export function subscribeGapUnlock(listener) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(GAP_UNLOCK_CHANGED, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(GAP_UNLOCK_CHANGED, listener)
    window.removeEventListener('storage', listener)
  }
}
