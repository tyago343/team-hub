import { Injectable } from '@nestjs/common';
import type { UserId } from '../../../user/domain/user-id';
import { OpaqueTokenHasher } from '../../domain/opaque-token-hasher.port';
import { RefreshTokenRepository } from '../../domain/refresh-token.repository';

export interface LogoutCommand {
  userId: UserId;
  refreshToken: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly opaqueTokenHasher: OpaqueTokenHasher,
    private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const hash = this.opaqueTokenHasher.hash(command.refreshToken);
    const row = await this.refreshTokens.findByTokenHash(hash);
    if (row && row.userId === command.userId && row.isActive()) {
      await this.refreshTokens.revokeByTokenHash(hash);
    }
  }
}
