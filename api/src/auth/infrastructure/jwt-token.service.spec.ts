/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { JwtService } from '@nestjs/jwt';
import { Role } from '../../organization/domain/role';
import {
  ExpiredRefreshTokenError,
  InvalidRefreshTokenError,
  JwtTokenExpiredError,
  JwtTokenInvalidError,
} from '../domain/auth.errors';
import {
  JWT_ACCESS_SERVICE,
  JWT_REFRESH_SERVICE,
  JwtTokenService,
} from './jwt-token.service';

const payload = {
  sub: '550e8400-e29b-41d4-a716-446655440300',
  email: 'jane@example.com',
  organizationId: '550e8400-e29b-41d4-a716-446655440301',
  memberId: '550e8400-e29b-41d4-a716-446655440302',
  role: Role.OWNER,
};

function tokenExpiredError(): Error {
  const err = new Error('jwt expired');
  err.name = 'TokenExpiredError';
  return err;
}

describe('JwtTokenService', () => {
  it('generateAccessToken delegates to access JwtService', async () => {
    const accessJwt = {
      signAsync: jest.fn(async () => 'access.jwt'),
    } as unknown as JwtService;
    const refreshJwt = {
      signAsync: jest.fn(),
      decode: jest.fn(),
    } as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.generateAccessToken(payload)).resolves.toBe(
      'access.jwt',
    );
    expect(accessJwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        ...payload,
        jti: expect.any(String),
      }),
    );
  });

  it('generateRefreshToken returns token and expiresAt from decode exp', async () => {
    const expSec = Math.floor(Date.now() / 1000) + 3600;
    const accessJwt = {} as unknown as JwtService;
    const refreshJwt = {
      signAsync: jest.fn(async () => 'refresh.jwt'),
      decode: jest.fn(() => ({ exp: expSec })),
    } as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    const result = await service.generateRefreshToken(payload);

    expect(result.token).toBe('refresh.jwt');
    expect(result.expiresAt).toEqual(new Date(expSec * 1000));
  });

  it('generateRefreshToken throws JwtTokenInvalidError when exp missing', async () => {
    const accessJwt = {} as unknown as JwtService;
    const refreshJwt = {
      signAsync: jest.fn(async () => 'refresh.jwt'),
      decode: jest.fn(() => ({})),
    } as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.generateRefreshToken(payload)).rejects.toThrow(
      JwtTokenInvalidError,
    );
  });

  it('verifyAccessToken returns payload when verify succeeds', async () => {
    const accessJwt = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(async () => ({ ...payload })),
    } as unknown as JwtService;
    const refreshJwt = {} as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.verifyAccessToken('tok')).resolves.toEqual(payload);
  });

  it('verifyAccessToken maps TokenExpiredError to JwtTokenExpiredError', async () => {
    const accessJwt = {
      verifyAsync: jest.fn(async () => {
        throw tokenExpiredError();
      }),
    } as unknown as JwtService;
    const refreshJwt = {} as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.verifyAccessToken('tok')).rejects.toThrow(
      JwtTokenExpiredError,
    );
  });

  it('verifyAccessToken maps other errors to JwtTokenInvalidError', async () => {
    const accessJwt = {
      verifyAsync: jest.fn(async () => {
        throw new Error('bad sig');
      }),
    } as unknown as JwtService;
    const refreshJwt = {} as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.verifyAccessToken('tok')).rejects.toThrow(
      JwtTokenInvalidError,
    );
  });

  it('verifyAccessToken preserves JwtTokenInvalidError instance', async () => {
    const accessJwt = {
      verifyAsync: jest.fn(async () => {
        throw new JwtTokenInvalidError('custom');
      }),
    } as unknown as JwtService;
    const refreshJwt = {} as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.verifyAccessToken('tok')).rejects.toMatchObject({
      message: 'custom',
    });
  });

  it('verifyRefreshToken returns payload when verify succeeds', async () => {
    const accessJwt = {} as unknown as JwtService;
    const refreshJwt = {
      verifyAsync: jest.fn(async () => ({ ...payload })),
    } as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.verifyRefreshToken('tok')).resolves.toEqual(payload);
  });

  it('verifyRefreshToken maps TokenExpiredError to ExpiredRefreshTokenError', async () => {
    const accessJwt = {} as unknown as JwtService;
    const refreshJwt = {
      verifyAsync: jest.fn(async () => {
        throw tokenExpiredError();
      }),
    } as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.verifyRefreshToken('tok')).rejects.toThrow(
      ExpiredRefreshTokenError,
    );
  });

  it('verifyRefreshToken maps other errors to InvalidRefreshTokenError', async () => {
    const accessJwt = {} as unknown as JwtService;
    const refreshJwt = {
      verifyAsync: jest.fn(async () => {
        throw new Error('bad');
      }),
    } as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.verifyRefreshToken('tok')).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });

  it('verifyRefreshToken preserves InvalidRefreshTokenError from payload assertion', async () => {
    const accessJwt = {} as unknown as JwtService;
    const refreshJwt = {
      verifyAsync: jest.fn(async () => ({ sub: 'only-sub' })),
    } as unknown as JwtService;

    const service = new JwtTokenService(accessJwt, refreshJwt);
    await expect(service.verifyRefreshToken('tok')).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });

  it('exposes JWT_ACCESS_SERVICE and JWT_REFRESH_SERVICE injection tokens', () => {
    expect(JWT_ACCESS_SERVICE).toBe('JWT_ACCESS_SERVICE');
    expect(JWT_REFRESH_SERVICE).toBe('JWT_REFRESH_SERVICE');
  });
});
