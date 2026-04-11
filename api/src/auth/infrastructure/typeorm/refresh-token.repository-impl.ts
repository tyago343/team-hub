import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UserId } from '../../../user/domain/user-id';
import { RefreshToken } from '../../domain/refresh-token';
import { RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { RefreshTokenEntity } from './refresh-token.entity';
import { RefreshTokenMapper } from './refresh-token.mapper';

@Injectable()
export class RefreshTokenRepositoryImpl extends RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly ormRepository: Repository<RefreshTokenEntity>,
  ) {
    super();
  }

  async save(token: RefreshToken): Promise<RefreshToken> {
    const entity = RefreshTokenMapper.toEntity(token);
    await this.ormRepository.save(entity);
    return token;
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const row = await this.ormRepository.findOne({ where: { tokenHash } });
    return row ? RefreshTokenMapper.toDomain(row) : null;
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.ormRepository.update({ tokenHash }, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId: UserId): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update(RefreshTokenEntity)
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('revokedAt IS NULL')
      .execute();
  }
}
