import { Injectable } from '@nestjs/common';
import { MemberRepository } from '../../../organization/domain/member.repository';
import type { UserId } from '../../../user/domain/user-id';
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from '../../domain/auth.errors';
import { OpaqueTokenHasher } from '../../domain/opaque-token-hasher.port';
import { RefreshToken } from '../../domain/refresh-token';
import { RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { TokenService } from '../../domain/token.port';
import type { TokenPayload } from '../../domain/token-payload';

export interface RefreshTokenCommand {
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly members: MemberRepository,
    private readonly tokenService: TokenService,
    private readonly opaqueTokenHasher: OpaqueTokenHasher,
    private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const payload = await this.tokenService.verifyRefreshToken(
      command.refreshToken,
    );
    const hash = this.opaqueTokenHasher.hash(command.refreshToken);
    const row = await this.refreshTokens.findByTokenHash(hash);
    if (!row || !row.isActive()) {
      throw new InvalidRefreshTokenError();
    }
    if (row.userId !== (payload.sub as UserId)) {
      throw new InvalidRefreshTokenError();
    }

    const member = await this.members.findByUserId(payload.sub as UserId);
    if (!member) {
      throw new InvalidCredentialsError();
    }

    const newPayload: TokenPayload = {
      sub: payload.sub,
      email: payload.email,
      organizationId: member.organizationId,
      memberId: member.id,
      role: member.role,
    };

    await this.refreshTokens.revokeByTokenHash(hash);

    const accessToken = await this.tokenService.generateAccessToken(newPayload);
    const { token: newRefresh, expiresAt } =
      await this.tokenService.generateRefreshToken(newPayload);
    const newHash = this.opaqueTokenHasher.hash(newRefresh);
    const newRow = RefreshToken.create({
      userId: member.userId,
      tokenHash: newHash,
      expiresAt,
    });
    await this.refreshTokens.save(newRow);

    return { accessToken, refreshToken: newRefresh };
  }
}
