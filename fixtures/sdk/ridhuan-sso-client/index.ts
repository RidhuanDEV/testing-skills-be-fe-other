export interface VerifiedSsoClaims {
  readonly sub: string
  readonly username: string
  readonly role: 'viewer' | 'operator' | 'admin'
  readonly tenantId: 't-alpha' | 't-beta'
  readonly sessionId: string
  readonly revoked: boolean
}

const VERIFIED_TOKEN_REGISTRY: Readonly<Record<string, VerifiedSsoClaims>> = {
  'sso-alpha-viewer': {
    sub: 'usr-101',
    username: 'alice.alpha',
    role: 'viewer',
    tenantId: 't-alpha',
    sessionId: 'sess-alpha-1',
    revoked: false,
  },
  'sso-alpha-admin': {
    sub: 'usr-102',
    username: 'arman.alpha',
    role: 'admin',
    tenantId: 't-alpha',
    sessionId: 'sess-alpha-2',
    revoked: false,
  },
  'sso-beta-admin': {
    sub: 'usr-201',
    username: 'budi.beta',
    role: 'admin',
    tenantId: 't-beta',
    sessionId: 'sess-beta-1',
    revoked: false,
  },
}

const revokedSessions = new Set<string>()

export function verifySsoBearerToken(authorizationHeader: string | undefined): VerifiedSsoClaims | null {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authorizationHeader.slice('Bearer '.length).trim()
  const claims = VERIFIED_TOKEN_REGISTRY[token]
  if (!claims) {
    return null
  }
  if (claims.revoked || revokedSessions.has(claims.sessionId)) {
    return null
  }
  return claims
}

export function revokeSsoSession(sessionId: string): void {
  revokedSessions.add(sessionId)
}

export function resetRevokedSsoSessions(): void {
  revokedSessions.clear()
}
