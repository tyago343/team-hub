/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { Member } from '../../../organization/domain/Member';
import { MemberRepository } from '../../../organization/domain/member.repository';
import { Role } from '../../../organization/domain/role';
import type { OrganizationId } from '../../../organization/domain/organization-id';
import type { MemberId } from '../../../organization/domain/member-id';
import type { UserId } from '../../../user/domain/user-id';
import {
  ExpiredRefreshTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from '../../domain/auth.errors';
import { OpaqueTokenHasher } from '../../domain/opaque-token-hasher.port';
import { RefreshToken } from '../../domain/refresh-token';
import { RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { TokenService } from '../../domain/token.port';

describe('RefreshTokenUseCase', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440300' as UserId;
  const orgId = '550e8400-e29b-41d4-a716-446655440301' as OrganizationId;
  const memberId = '550e8400-e29b-41d4-a716-446655440302' as MemberId;

  const payload = {
    sub: userId,
    email: 'jane@example.com',
    organizationId: orgId,
    memberId,
    role: Role.OWNER,
  };

  it('rotates refresh token on success', async () => {
    const expiresAt = new Date(Date.now() + 86_400_000);
    const stored = RefreshToken.create({
      userId,
      tokenHash: 'h:raw',
      expiresAt,
    });

    const members = {
      findByUserId: jest.fn(async () =>
        Member.fromPrimitives({
          id: memberId,
          userId,
          organizationId: orgId,
          role: Role.OWNER,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    } as unknown as MemberRepository;

    const tokenService = {
      verifyRefreshToken: jest.fn(async () => payload),
      generateAccessToken: jest.fn(async () => 'new-access'),
      generateRefreshToken: jest.fn(async () => ({
        token: 'new-refresh',
        expiresAt: new Date(Date.now() + 86_400_000),
      })),
    } as unknown as TokenService;

    const opaqueHasher = {
      hash: jest.fn((s: string) => (s === 'raw' ? 'h:raw' : `h:${s}`)),
    } as unknown as OpaqueTokenHasher;

    const refreshTokens = {
      findByTokenHash: jest.fn(async (h: string) =>
        h === 'h:raw' ? stored : null,
      ),
      revokeByTokenHash: jest.fn(async () => {}),
      save: jest.fn(async (t) => t),
    } as unknown as RefreshTokenRepository;

    const useCase = new RefreshTokenUseCase(
      members,
      tokenService,
      opaqueHasher,
      refreshTokens,
    );

    const result = await useCase.execute({ refreshToken: 'raw' });

    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(refreshTokens.revokeByTokenHash).toHaveBeenCalledWith('h:raw');
    expect(refreshTokens.save).toHaveBeenCalledTimes(1);
  });

  it('throws when stored token missing', async () => {
    const tokenService = {
      verifyRefreshToken: jest.fn(async () => payload),
    } as unknown as TokenService;
    const opaqueHasher = {
      hash: jest.fn(() => 'h:missing'),
    } as unknown as OpaqueTokenHasher;
    const refreshTokens = {
      findByTokenHash: jest.fn(async () => null),
    } as unknown as RefreshTokenRepository;

    const useCase = new RefreshTokenUseCase(
      {} as MemberRepository,
      tokenService,
      opaqueHasher,
      refreshTokens,
    );

    await expect(useCase.execute({ refreshToken: 'any' })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });

  it('throws when stored token is revoked', async () => {
    const expiresAt = new Date(Date.now() + 86_400_000);
    const stored = RefreshToken.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440400',
      userId,
      tokenHash: 'h:raw',
      expiresAt,
      revokedAt: new Date(),
      createdAt: new Date(),
    });

    const tokenService = {
      verifyRefreshToken: jest.fn(async () => payload),
    } as unknown as TokenService;
    const opaqueHasher = {
      hash: jest.fn(() => 'h:raw'),
    } as unknown as OpaqueTokenHasher;
    const refreshTokens = {
      findByTokenHash: jest.fn(async () => stored),
    } as unknown as RefreshTokenRepository;

    const useCase = new RefreshTokenUseCase(
      {} as MemberRepository,
      tokenService,
      opaqueHasher,
      refreshTokens,
    );

    await expect(useCase.execute({ refreshToken: 'raw' })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });

  it('throws when JWT userId does not match stored row', async () => {
    const otherUserId = '660e8400-e29b-41d4-a716-446655440300' as UserId;
    const expiresAt = new Date(Date.now() + 86_400_000);
    const stored = RefreshToken.create({
      userId: otherUserId,
      tokenHash: 'h:raw',
      expiresAt,
    });

    const tokenService = {
      verifyRefreshToken: jest.fn(async () => payload),
    } as unknown as TokenService;
    const opaqueHasher = {
      hash: jest.fn(() => 'h:raw'),
    } as unknown as OpaqueTokenHasher;
    const refreshTokens = {
      findByTokenHash: jest.fn(async () => stored),
    } as unknown as RefreshTokenRepository;

    const useCase = new RefreshTokenUseCase(
      {} as MemberRepository,
      tokenService,
      opaqueHasher,
      refreshTokens,
    );

    await expect(useCase.execute({ refreshToken: 'raw' })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });

  it('throws InvalidCredentialsError when member not found after verify', async () => {
    const expiresAt = new Date(Date.now() + 86_400_000);
    const stored = RefreshToken.create({
      userId,
      tokenHash: 'h:raw',
      expiresAt,
    });

    const members = {
      findByUserId: jest.fn(async () => null),
    } as unknown as MemberRepository;

    const tokenService = {
      verifyRefreshToken: jest.fn(async () => payload),
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    } as unknown as TokenService;

    const opaqueHasher = {
      hash: jest.fn((s: string) => (s === 'raw' ? 'h:raw' : `h:${s}`)),
    } as unknown as OpaqueTokenHasher;

    const refreshTokens = {
      findByTokenHash: jest.fn(async () => stored),
      revokeByTokenHash: jest.fn(),
      save: jest.fn(),
    } as unknown as RefreshTokenRepository;

    const useCase = new RefreshTokenUseCase(
      members,
      tokenService,
      opaqueHasher,
      refreshTokens,
    );

    await expect(useCase.execute({ refreshToken: 'raw' })).rejects.toThrow(
      InvalidCredentialsError,
    );
  });

  it('rethrows ExpiredRefreshTokenError from token service', async () => {
    const tokenService = {
      verifyRefreshToken: jest.fn(async () => {
        throw new ExpiredRefreshTokenError();
      }),
    } as unknown as TokenService;

    const useCase = new RefreshTokenUseCase(
      {} as MemberRepository,
      tokenService,
      { hash: jest.fn() } as unknown as OpaqueTokenHasher,
      {} as RefreshTokenRepository,
    );

    await expect(useCase.execute({ refreshToken: 'expired' })).rejects.toThrow(
      ExpiredRefreshTokenError,
    );
  });
});
