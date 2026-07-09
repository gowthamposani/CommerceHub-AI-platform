import { createHmac, randomUUID } from 'node:crypto';

import type { RoleName } from '../types/auth.types';

export interface JwtTokenOptions {
  subject: string;
  tokenType: 'access' | 'refresh';
  expiresInSeconds: number;
  secret: string;
  issuer?: string;
  audience?: string;
  extraClaims?: Record<string, unknown>;
}

const base64UrlEncode = (value: string | Buffer): string =>
  Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const sign = (payload: string, secret: string): string =>
  base64UrlEncode(createHmac('sha256', secret).update(payload).digest());

export class JwtUtility {
  static createToken(options: JwtTokenOptions): string {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + options.expiresInSeconds;
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
    const payload: Record<string, unknown> = {
      sub: options.subject,
      type: options.tokenType,
      iat: now,
      nbf: now,
      exp: expiresAt,
      jti: randomUUID(),
    };

    if (options.issuer) {
      payload.iss = options.issuer;
    }
    if (options.audience) {
      payload.aud = options.audience;
    }
    if (options.extraClaims) {
      Object.assign(payload, options.extraClaims);
    }

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    return `${signingInput}.${sign(signingInput, options.secret)}`;
  }

  static createExpiredAccessToken(options: Omit<JwtTokenOptions, 'tokenType' | 'expiresInSeconds'>): string {
    return this.createToken({
      ...options,
      tokenType: 'access',
      expiresInSeconds: -300,
    });
  }

  static createInvalidSignatureToken(
    options: Omit<JwtTokenOptions, 'secret'> & { secret?: string; invalidSecret?: string },
  ): string {
    return this.createToken({
      ...options,
      secret: options.invalidSecret ?? 'invalid-secret',
    });
  }

  static createAuthClaims(email: string, role: RoleName): Record<string, string> {
    return {
      email,
      role,
    };
  }
}
