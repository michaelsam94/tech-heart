export default {
  slug: 'oauth2-pkce-spa',
  title: 'OAuth 2.1-minded PKCE for single-page apps',
  date: '2026-03-18',
  readMin: 20,
  tags: ['Security', 'Web'],
  excerpt:
    'Why public clients use PKCE with S256, how the authorize and token steps differ, and a minimal browser-side shape—without storing client secrets.',
  sections: [
    {
      p: [
        'Single-page applications cannot safely embed OAuth client secrets; anything shipped to the browser is extractable. Proof Key for Code Exchange (PKCE) lets a public client prove that the authorization code redemption originated from the same session that started the flow.',
        'Attack it mitigates: authorization code interception (malicious app registers same custom URL scheme or sits on localhost) becomes useless without the verifier that never went over the wire in predictable form.',
        'OAuth 2.1 drafts tighten defaults: PKCE is required for authorization code flows, refresh token rotation is encouraged, and implicit flows are discouraged for new work.',
      ],
    },
    {
      h2: 'Shape of the flow',
    },
    {
      ul: [
        'Generate code_verifier (high-entropy random string, typically 43–128 chars from unreserved charset) and derive code_challenge = BASE64URL(SHA256(verifier)) for method S256.',
        'Send the user to /authorize with response_type=code, client_id, redirect_uri, scope, state, code_challenge, code_challenge_method=S256.',
        'On callback, validate state (CSRF) and exchange the code at /token with grant_type=authorization_code, code, redirect_uri, client_id, and code_verifier. Never send the verifier on the authorize URL—only the challenge.',
        'Store tokens in memory or behind your own HTTP-only cookie session if a backend exchanges codes; avoid localStorage for high-value refresh tokens because XSS exfiltration is a first-class threat.',
      ],
    },
    {
      h2: 'Why S256 over plain',
    },
    {
      p: [
        'Plain PKCE (challenge equals verifier) is simpler but weaker if a server misconfiguration or downgrade is possible. S256 is the modern default; only use plain when mandated by a legacy server and you understand the tradeoff.',
      ],
    },
    {
      h2: 'Browser helpers (conceptual)',
    },
    {
      p: [
        'The verifier should be cryptographically random—use crypto.getRandomValues. Encoding: base64url without padding is common. The sample below derives S256 challenge with SubtleCrypto.',
      ],
    },
    {
      code: {
        lang: 'ts',
        code: `async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  const b64 = btoa(binary)
  return b64.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')
}

export async function buildPkcePair() {
  const raw = crypto.getRandomValues(new Uint8Array(32))
  const verifier = btoa(String.fromCharCode(...raw))
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '')
  const challenge = await sha256Base64Url(verifier)
  return { verifier, challenge }
}

/** Build authorize URL (details depend on your IdP). */
export function authorizeUrl(params: {
  base: string
  clientId: string
  redirectUri: string
  scope: string
  state: string
  challenge: string
}) {
  const u = new URL('/authorize', params.base)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('client_id', params.clientId)
  u.searchParams.set('redirect_uri', params.redirectUri)
  u.searchParams.set('scope', params.scope)
  u.searchParams.set('state', params.state)
  u.searchParams.set('code_challenge', params.challenge)
  u.searchParams.set('code_challenge_method', 'S256')
  return u.toString()
}`,
      },
    },
    {
      h2: 'Session storage for verifier',
    },
    {
      p: [
        'Between redirecting to the IdP and landing on your redirect_uri, you must recover the verifier. sessionStorage is a common choice (tab-scoped, cleared when the tab closes). In-memory only works if your app stays alive across the redirect—which it does not in a full page navigation; use sessionStorage or a backend session keyed by state.',
      ],
    },
    {
      h2: 'Operational checklist',
    },
    {
      ul: [
        'Register exact redirect URIs—no wildcards in production.',
        'Rotate refresh tokens if your IdP supports binding and rotation; detect reuse and revoke sessions.',
        'Use short-lived access tokens and scope minimization; re-prompt for sensitive scopes.',
        'Log token endpoint errors without logging verifiers or refresh tokens.',
      ],
    },
  ],
}
