export default {
  slug: 'oauth2-pkce-spa',
  title: 'OAuth 2.1-minded PKCE for single-page apps',
  date: '2026-03-18',
  readMin: 10,
  tags: ['Security', 'Web'],
  excerpt:
    'Why public clients use PKCE with S256, how the authorize and token steps differ, and a minimal browser-side shape—without storing client secrets.',
  sections: [
    {
      p: [
        'Single-page applications cannot safely embed OAuth client secrets; anything shipped to the browser is extractable. Proof Key for Code Exchange (PKCE) lets a public client prove that the authorization code redemption originated from the same session that started the flow.',
        'OAuth 2.1 drafts tighten defaults: PKCE is required for authorization code flows, refresh token rotation is encouraged, and implicit flows are discouraged.',
      ],
    },
    {
      h2: 'Shape of the flow',
    },
    {
      ul: [
        'Generate code_verifier (high-entropy random string) and derive code_challenge = BASE64URL(SHA256(verifier)) for method S256.',
        'Send the user to /authorize with response_type=code, client_id, redirect_uri, scope, state, code_challenge, code_challenge_method.',
        'On callback, exchange the code at /token with grant_type=authorization_code, code, redirect_uri, client_id, and code_verifier.',
        'Validate state and stash tokens in memory or secure HTTP-only cookies if your backend mediates—avoid localStorage for high-value refresh tokens.',
      ],
    },
    {
      h2: 'Browser helpers (conceptual)',
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
  const verifier = crypto.getRandomValues(new Uint8Array(32))
  const verifierB64 = btoa(String.fromCharCode(...verifier))
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '')
  const challenge = await sha256Base64Url(verifierB64)
  return { verifier: verifierB64, challenge }
}`,
      },
    },
    {
      h2: 'Operational checklist',
    },
    {
      ul: [
        'Register exact redirect URIs—no wildcards in production.',
        'Rotate refresh tokens if your IdP supports binding and rotation; detect reuse.',
        'Use short-lived access tokens and scope minimization.',
      ],
    },
  ],
}
