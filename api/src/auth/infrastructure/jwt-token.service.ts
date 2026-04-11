import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isRole } from '../../organization/domain/role';
import {
  ExpiredRefreshTokenError,
  InvalidRefreshTokenError,
  JwtTokenExpiredError,
  JwtTokenInvalidError,
} from '../domain/auth.errors';
import type { TokenPayload } from '../domain/token-payload';
import { type RefreshTokenPair, TokenService } from '../domain/token.port';

export const JWT_ACCESS_SERVICE = 'JWT_ACCESS_SERVICE';
export const JWT_REFRESH_SERVICE = 'JWT_REFRESH_SERVICE';

function assertTokenPayload(raw: unknown): TokenPayload {
  if (
    typeof raw !== 'object' ||
    raw === null ||
    !('sub' in raw) ||
    !('email' in raw) ||
    !('organizationId' in raw) ||
    !('memberId' in raw) ||
    !('role' in raw)
  ) {
    throw new InvalidRefreshTokenError('Malformed token payload');
  }
  const p = raw as Record<string, unknown>;
  const role = p.role;
  if (typeof role !== 'string' || !isRole(role)) {
    throw new InvalidRefreshTokenError('Invalid role in token');
  }
  return {
    sub: String(p.sub),
    email: String(p.email),
    organizationId: String(p.organizationId),
    memberId: String(p.memberId),
    role,
  };
}

@Injectable()
export class JwtTokenService extends TokenService {
  constructor(
    @Inject(JWT_ACCESS_SERVICE)
    private readonly accessJwt: JwtService,
    @Inject(JWT_REFRESH_SERVICE)
    private readonly refreshJwt: JwtService,
  ) {
    super();
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.accessJwt.signAsync({ ...payload, jti: randomUUID() });
  }

  async generateRefreshToken(payload: TokenPayload): Promise<RefreshTokenPair> {
    const token = await this.refreshJwt.signAsync({
      ...payload,
      jti: randomUUID(),
    });
    const decoded: unknown = this.refreshJwt.decode(token);
    const expSec =
      decoded &&
      typeof decoded === 'object' &&
      'exp' in decoded &&
      typeof (decoded as { exp: unknown }).exp === 'number'
        ? (decoded as { exp: number }).exp
        : undefined;
    if (expSec === undefined) {
      throw new JwtTokenInvalidError('JWT decode missing exp');
    }
    return { token, expiresAt: new Date(expSec * 1000) };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const raw =
        await this.accessJwt.verifyAsync<Record<string, unknown>>(token);
      return assertTokenPayload(raw);
    } catch (err) {
      if (err instanceof JwtTokenExpiredError) {
        throw err;
      }
      if (err instanceof JwtTokenInvalidError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        throw new JwtTokenExpiredError();
      }
      throw new JwtTokenInvalidError();
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const raw =
        await this.refreshJwt.verifyAsync<Record<string, unknown>>(token);
      return assertTokenPayload(raw);
    } catch (err) {
      if (err instanceof ExpiredRefreshTokenError) {
        throw err;
      }
      if (err instanceof InvalidRefreshTokenError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        throw new ExpiredRefreshTokenError();
      }
      throw new InvalidRefreshTokenError();
    }
  }
}
