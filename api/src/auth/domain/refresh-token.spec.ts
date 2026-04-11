import { RefreshToken } from './refresh-token';
import type { UserId } from '../../user/domain/user-id';

describe('RefreshToken', () => {
  it('isActive returns true before expiry when not revoked', () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const token = RefreshToken.create({
      userId: '550e8400-e29b-41d4-a716-446655440000' as UserId,
      tokenHash: 'abc',
      expiresAt,
    });
    expect(token.isActive()).toBe(true);
  });

  it('isActive returns false after revoke', () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const token = RefreshToken.create({
      userId: '550e8400-e29b-41d4-a716-446655440000' as UserId,
      tokenHash: 'abc',
      expiresAt,
    });
    token.revoke();
    expect(token.isActive()).toBe(false);
  });

  it('isActive returns false after expiry', () => {
    const expiresAt = new Date(Date.now() - 60_000);
    const token = RefreshToken.create({
      userId: '550e8400-e29b-41d4-a716-446655440000' as UserId,
      tokenHash: 'abc',
      expiresAt,
    });
    expect(token.isActive()).toBe(false);
  });
});
