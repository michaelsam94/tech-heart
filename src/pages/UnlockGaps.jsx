import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGapUnlocked } from '../hooks/useGapUnlocked'
import {
  clearGapUnlocked,
  isGapUnlockConfigured,
  setGapUnlocked,
  verifyGapUnlockPhrase,
} from '../lib/gapLock'

export function UnlockGaps() {
  const navigate = useNavigate()
  const configured = isGapUnlockConfigured()
  const unlocked = useGapUnlocked()
  const [phrase, setPhrase] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!configured) {
      setError('Unlock is not configured yet. Set a SHA-256 hash at build time (see below).')
      return
    }
    if (!phrase || phrase.length !== 12) {
      setError('Use exactly 12 characters.')
      return
    }
    setBusy(true)
    try {
      const ok = await verifyGapUnlockPhrase(phrase)
      if (!ok) {
        setError('That passphrase does not match the configured hash.')
        return
      }
      setGapUnlocked()
      setPhrase('')
      navigate('/')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gap-unlock">
      <header className="page-intro">
        <h1>Private gap library</h1>
        <p>
          CV gap notes stay off the public index until you enter the 12-character
          owner passphrase (digits + at least one symbol). The site only stores a
          SHA-256 hash—never the raw phrase in the repo.
        </p>
      </header>

      {!configured && (
        <section className="gap-unlock-panel" aria-labelledby="cfg-title">
          <h2 id="cfg-title">Not configured</h2>
          <p>
            Set <code>VITE_GAP_UNLOCK_SHA256</code> to a{' '}
            <strong>64-character lowercase hex</strong> SHA-256 of your passphrase,
            or paste the same hash into{' '}
            <code>src/config/gapLockSecret.js</code> as{' '}
            <code>GAP_UNLOCK_SHA256_FALLBACK</code>, then rebuild.
          </p>
          <pre className="gap-unlock-snippet">
            {`node -e "const c=require('crypto');const p='YOUR12CHARS!';if(p.length!==12)throw new Error('length');console.log(c.createHash('sha256').update(p).digest('hex'))"`}
          </pre>
          <p>
            Passphrase rules: length <strong>12</strong>, includes at least one{' '}
            <strong>digit</strong> and one <strong>non-letter, non-digit</strong>{' '}
            character (symbol or punctuation).
          </p>
        </section>
      )}

      {configured && (
        <section className="gap-unlock-panel" aria-labelledby="form-title">
          <h2 id="form-title">{unlocked ? 'Unlocked' : 'Enter passphrase'}</h2>
          {unlocked ? (
            <>
              <p>Gap articles are visible on the home page and open normally.</p>
              <button
                type="button"
                className="gap-unlock-button secondary"
                onClick={() => {
                  clearGapUnlocked()
                  setError('')
                }}
              >
                Lock again on this browser
              </button>
            </>
          ) : (
            <form onSubmit={onSubmit} className="gap-unlock-form" autoComplete="off">
              <label htmlFor="gap-pass">12-character passphrase</label>
              <input
                id="gap-pass"
                name="gap-pass"
                type="password"
                inputMode="text"
                autoComplete="new-password"
                maxLength={12}
                minLength={12}
                value={phrase}
                onChange={(ev) => setPhrase(ev.target.value)}
                placeholder="e.g. ab3!x#9K@2z"
                className="gap-unlock-input"
              />
              <p className="gap-unlock-hint">
                Exactly 12 characters; must include a digit and a symbol (not letters
                or digits only).
              </p>
              {error ? (
                <p className="gap-unlock-error" role="alert">
                  {error}
                </p>
              ) : null}
              <button type="submit" className="gap-unlock-button" disabled={busy}>
                {busy ? 'Checking…' : 'Unlock gap library'}
              </button>
            </form>
          )}
        </section>
      )}

      <p className="gap-unlock-back">
        <Link to="/">← Back to articles</Link>
      </p>
    </div>
  )
}
