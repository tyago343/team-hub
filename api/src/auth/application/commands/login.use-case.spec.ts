/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { LoginUseCase } from './login.use-case';
import { Organization } from '../../../organization/domain/Organization';
import { OrganizationRepository } from '../../../organization/domain/organization.repository';
import { Member } from '../../../organization/domain/Member';
import { MemberRepository } from '../../../organization/domain/member.repository';
import { Role } from '../../../organization/domain/role';
import type { OrganizationId } from '../../../organization/domain/organization-id';
import type { MemberId } from '../../../organization/domain/member-id';
import { User } from '../../../user/domain/User';
import { UserRepository } from '../../../user/domain/user.repository';
import type { UserId } from '../../../user/domain/user-id';
import { HashedPassword } from '../../../user/domain/hashed-password.type';
import { PasswordHasher } from '../../../user/domain/password-hasher.port';
import { InvalidCredentialsError } from '../../domain/auth.errors';
import { OpaqueTokenHasher } from '../../domain/opaque-token-hasher.port';
import { RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { TokenService } from '../../domain/token.port';

const HASHED = '$2b$hashed' as HashedPassword;

describe('LoginUseCase', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440300' as UserId;
  const orgId = '550e8400-e29b-41d4-a716-446655440301' as OrganizationId;
  const memberId = '550e8400-e29b-41d4-a716-446655440302' as MemberId;

  function makeUser() {
    return User.fromPrimitives({
      id: userId,
      email: 'jane@example.com',
      password: HASHED,
      fullname: 'Jane',
      emailVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  function makeMember() {
    return Member.fromPrimitives({
      id: memberId,
      userId,
      organizationId: orgId,
      role: Role.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  function makeOrg() {
    return Organization.fromPrimitives({
      id: orgId,
      name: 'Acme',
      slug: 'acme',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  it('returns tokens and profile on success', async () => {
    const users = {
      findByEmail: jest.fn(async () => makeUser()),
    } as unknown as UserRepository;
    const members = {
      findByUserId: jest.fn(async () => makeMember()),
    } as unknown as MemberRepository;
    const organizations = {
      findById: jest.fn(async () => makeOrg()),
    } as unknown as OrganizationRepository;
    const passwordHasher = {
      compare: jest.fn(async () => true),
    } as unknown as PasswordHasher;
    const tokenService = {
      generateAccessToken: jest.fn(async () => 'access'),
      generateRefreshToken: jest.fn(async () => ({
        token: 'refresh',
        expiresAt: new Date(Date.now() + 86_400_000),
      })),
    } as unknown as TokenService;
    const opaqueHasher = {
      hash: jest.fn((s: string) => `h:${s}`),
    } as unknown as OpaqueTokenHasher;
    const refreshTokens = {
      save: jest.fn(async (t) => t),
    } as unknown as RefreshTokenRepository;

    const useCase = new LoginUseCase(
      users,
      members,
      organizations,
      passwordHasher,
      tokenService,
      opaqueHasher,
      refreshTokens,
    );

    const result = await useCase.execute({
      email: 'jane@example.com',
      password: 'secret',
    });

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
    expect(passwordHasher.compare).toHaveBeenCalled();
    expect(refreshTokens.save).toHaveBeenCalledTimes(1);
  });

  it('throws InvalidCredentialsError when user not found', async () => {
    const users = {
      findByEmail: jest.fn(async () => null),
    } as unknown as UserRepository;
    const useCase = new LoginUseCase(
      users,
      {} as MemberRepository,
      {} as OrganizationRepository,
      { compare: jest.fn() } as unknown as PasswordHasher,
      {} as TokenService,
      { hash: jest.fn() } as unknown as OpaqueTokenHasher,
      {} as RefreshTokenRepository,
    );

    await expect(
      useCase.execute({ email: 'x@y.com', password: 'p' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('throws InvalidCredentialsError when password wrong', async () => {
    const users = {
      findByEmail: jest.fn(async () => makeUser()),
    } as unknown as UserRepository;
    const passwordHasher = {
      compare: jest.fn(async () => false),
    } as unknown as PasswordHasher;
    const useCase = new LoginUseCase(
      users,
      {} as MemberRepository,
      {} as OrganizationRepository,
      passwordHasher,
      {} as TokenService,
      { hash: jest.fn() } as unknown as OpaqueTokenHasher,
      {} as RefreshTokenRepository,
    );

    await expect(
      useCase.execute({ email: 'jane@example.com', password: 'wrong' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('throws InvalidCredentialsError when member not found', async () => {
    const users = {
      findByEmail: jest.fn(async () => makeUser()),
    } as unknown as UserRepository;
    const members = {
      findByUserId: jest.fn(async () => null),
    } as unknown as MemberRepository;
    const passwordHasher = {
      compare: jest.fn(async () => true),
    } as unknown as PasswordHasher;
    const useCase = new LoginUseCase(
      users,
      members,
      {} as OrganizationRepository,
      passwordHasher,
      {} as TokenService,
      { hash: jest.fn() } as unknown as OpaqueTokenHasher,
      {} as RefreshTokenRepository,
    );

    await expect(
      useCase.execute({ email: 'jane@example.com', password: 'secret' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('throws InvalidCredentialsError when organization not found', async () => {
    const users = {
      findByEmail: jest.fn(async () => makeUser()),
    } as unknown as UserRepository;
    const members = {
      findByUserId: jest.fn(async () => makeMember()),
    } as unknown as MemberRepository;
    const organizations = {
      findById: jest.fn(async () => null),
    } as unknown as OrganizationRepository;
    const passwordHasher = {
      compare: jest.fn(async () => true),
    } as unknown as PasswordHasher;
    const useCase = new LoginUseCase(
      users,
      members,
      organizations,
      passwordHasher,
      {} as TokenService,
      { hash: jest.fn() } as unknown as OpaqueTokenHasher,
      {} as RefreshTokenRepository,
    );

    await expect(
      useCase.execute({ email: 'jane@example.com', password: 'secret' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });
});
