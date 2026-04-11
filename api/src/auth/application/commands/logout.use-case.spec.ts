/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { LogoutUseCase } from './logout.use-case';
import { RefreshToken } from '../../domain/refresh-token';
import type { UserId } from '../../../user/domain/user-id';
import { OpaqueTokenHasher } from '../../domain/opaque-token-hasher.port';
import { RefreshTokenRepository } from '../../domain/refresh-token.repository';

describe('LogoutUseCase', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440300' as UserId;

  it('revokes matching active refresh token', async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const row = RefreshToken.create({
      userId,
      tokenHash: 'h:tok',
      expiresAt,
    });

    const opaqueHasher = {
      hash: jest.fn(() => 'h:tok'),
    } as unknown as OpaqueTokenHasher;

    const refreshTokens = {
      findByTokenHash: jest.fn(async () => row),
      revokeByTokenHash: jest.fn(async () => {}),
    } as unknown as RefreshTokenRepository;

    const useCase = new LogoutUseCase(opaqueHasher, refreshTokens);
    await useCase.execute({ userId, refreshToken: 'tok' });

    expect(refreshTokens.revokeByTokenHash).toHaveBeenCalledWith('h:tok');
  });

  it('does not revoke when user mismatch', async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const row = RefreshToken.create({
      userId,
      tokenHash: 'h:tok',
      expiresAt,
    });

    const opaqueHasher = {
      hash: jest.fn(() => 'h:tok'),
    } as unknown as OpaqueTokenHasher;

    const refreshTokens = {
      findByTokenHash: jest.fn(async () => row),
      revokeByTokenHash: jest.fn(async () => {}),
    } as unknown as RefreshTokenRepository;

    const useCase = new LogoutUseCase(opaqueHasher, refreshTokens);
    const otherUser = '660e8400-e29b-41d4-a716-446655440300' as UserId;
    await useCase.execute({ userId: otherUser, refreshToken: 'tok' });

    expect(refreshTokens.revokeByTokenHash).not.toHaveBeenCalled();
  });

  it('does not revoke when token hash not found', async () => {
    const opaqueHasher = {
      hash: jest.fn(() => 'h:missing'),
    } as unknown as OpaqueTokenHasher;

    const refreshTokens = {
      findByTokenHash: jest.fn(async () => null),
      revokeByTokenHash: jest.fn(async () => {}),
    } as unknown as RefreshTokenRepository;

    const useCase = new LogoutUseCase(opaqueHasher, refreshTokens);
    await useCase.execute({ userId, refreshToken: 'tok' });

    expect(refreshTokens.revokeByTokenHash).not.toHaveBeenCalled();
  });

  it('does not revoke when token already revoked', async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const row = RefreshToken.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440400',
      userId,
      tokenHash: 'h:tok',
      expiresAt,
      revokedAt: new Date(),
      createdAt: new Date(),
    });

    const opaqueHasher = {
      hash: jest.fn(() => 'h:tok'),
    } as unknown as OpaqueTokenHasher;

    const refreshTokens = {
      findByTokenHash: jest.fn(async () => row),
      revokeByTokenHash: jest.fn(async () => {}),
    } as unknown as RefreshTokenRepository;

    const useCase = new LogoutUseCase(opaqueHasher, refreshTokens);
    await useCase.execute({ userId, refreshToken: 'tok' });

    expect(refreshTokens.revokeByTokenHash).not.toHaveBeenCalled();
  });
});
