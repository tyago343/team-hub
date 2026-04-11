import { RefreshToken } from '../../domain/refresh-token';
import { RefreshTokenEntity } from './refresh-token.entity';

export class RefreshTokenMapper {
  static toDomain(row: RefreshTokenEntity): RefreshToken {
    return RefreshToken.fromPrimitives({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
    });
  }

  static toEntity(domain: RefreshToken): RefreshTokenEntity {
    const p = domain.toPrimitives();
    const entity = new RefreshTokenEntity();
    entity.id = p.id;
    entity.userId = p.userId;
    entity.tokenHash = p.tokenHash;
    entity.expiresAt = p.expiresAt;
    entity.revokedAt = p.revokedAt;
    entity.createdAt = p.createdAt;
    return entity;
  }
}
