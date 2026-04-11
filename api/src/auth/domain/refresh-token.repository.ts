import type { UserId } from '../../user/domain/user-id';
import { RefreshToken } from './refresh-token';

export abstract class RefreshTokenRepository {
  abstract save(token: RefreshToken): Promise<RefreshToken>;
  abstract findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  abstract revokeByTokenHash(tokenHash: string): Promise<void>;
  abstract revokeAllForUser(userId: UserId): Promise<void>;
}
