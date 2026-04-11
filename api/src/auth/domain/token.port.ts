import type { TokenPayload } from './token-payload';

export interface RefreshTokenPair {
  token: string;
  expiresAt: Date;
}

export abstract class TokenService {
  abstract generateAccessToken(payload: TokenPayload): Promise<string>;
  abstract generateRefreshToken(
    payload: TokenPayload,
  ): Promise<RefreshTokenPair>;
  abstract verifyAccessToken(token: string): Promise<TokenPayload>;
  abstract verifyRefreshToken(token: string): Promise<TokenPayload>;
}
