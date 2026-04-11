/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { SignupUseCase } from './signup.use-case';
import { Organization } from '../../../organization/domain/Organization';
import { OrganizationRepository } from '../../../organization/domain/organization.repository';
import { Slug } from '../../../organization/domain/slug.vo';
import { MemberRepository } from '../../../organization/domain/member.repository';
import { Role } from '../../../organization/domain/role';
import {
  type TransactionalRepositories,
  UnitOfWork,
} from '../../../shared/ports/unit-of-work';
import { User } from '../../../user/domain/User';
import { SlugAllocationError } from '../../../organization/domain/organization.errors';
import {
  InvalidEmailError,
  UserAlreadyExistsError,
} from '../../../user/domain/user.errors';
import { PasswordHasher } from '../../../user/domain/password-hasher.port';
import { HashedPassword } from '../../../user/domain/hashed-password.type';
import type { UserId } from '../../../user/domain/user-id';
import type { OrganizationId } from '../../../organization/domain/organization-id';
import type { RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { OpaqueTokenHasher } from '../../domain/opaque-token-hasher.port';
import { TokenService } from '../../domain/token.port';

const HASHED = 'hashed_value' as HashedPassword;

function mockUserRepository(
  overrides: Partial<
    import('../../../user/domain/user.repository').UserRepository
  > = {},
) {
  return {
    save: jest.fn(async (user: User) => user),
    findByEmail: jest.fn(async () => null),
    findById: jest.fn(async () => null),
    findAll: jest.fn(async () => ({ data: [], total: 0 })),
    delete: jest.fn(async () => {}),
    update: jest.fn(async (user: User) => user),
    ...overrides,
  };
}

function mockOrganizationRepository(
  overrides: Partial<OrganizationRepository> = {},
): OrganizationRepository {
  return {
    save: jest.fn(async (org: Organization) => org),
    findById: jest.fn(async () => null),
    findBySlug: jest.fn(async () => null),
    findAll: jest.fn(async () => ({ data: [], total: 0 })),
    delete: jest.fn(async () => {}),
    update: jest.fn(async (org: Organization) => org),
    ...overrides,
  };
}

function mockMemberRepository(
  overrides: Partial<MemberRepository> = {},
): MemberRepository {
  return {
    save: jest.fn(async (m) => m),
    findById: jest.fn(async () => null),
    findByUserId: jest.fn(async () => null),
    findByUserAndOrganization: jest.fn(async () => null),
    delete: jest.fn(async () => {}),
    update: jest.fn(async (m) => m),
    ...overrides,
  };
}

function mockRefreshTokenRepository(
  overrides: Partial<RefreshTokenRepository> = {},
): RefreshTokenRepository {
  return {
    save: jest.fn(async (t) => t),
    findByTokenHash: jest.fn(async () => null),
    revokeByTokenHash: jest.fn(async () => {}),
    revokeAllForUser: jest.fn(async () => {}),
    ...overrides,
  };
}

function mockUnitOfWork(
  users: ReturnType<typeof mockUserRepository>,
  organizations: OrganizationRepository,
  members: MemberRepository,
  refreshTokens: RefreshTokenRepository,
): UnitOfWork {
  const execute = jest.fn(
    async <T>(
      work: (repos: TransactionalRepositories) => Promise<T>,
    ): Promise<T> => {
      return work({ users, organizations, members, refreshTokens });
    },
  );
  return { execute } as unknown as UnitOfWork;
}

function mockPasswordHasher(): PasswordHasher {
  return {
    hash: jest.fn(async () => HASHED),
    compare: jest.fn(async () => true),
  };
}

function mockTokenService(): TokenService {
  return {
    generateAccessToken: jest.fn(async () => 'access.jwt'),
    generateRefreshToken: jest.fn(async () => ({
      token: 'refresh.jwt',
      expiresAt: new Date(Date.now() + 86_400_000),
    })),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };
}

function mockOpaqueTokenHasher(): OpaqueTokenHasher {
  return {
    hash: jest.fn((s: string) => `hash:${s}`),
  };
}

const VALID = {
  fullname: 'Jane Doe',
  email: 'jane@example.com',
  password: 'password12',
  organizationName: 'Acme Inc',
};

describe('SignupUseCase', () => {
  it('should create user, organization, and OWNER member', async () => {
    const users = mockUserRepository();
    const organizations = mockOrganizationRepository();
    const members = mockMemberRepository();
    const refreshTokens = mockRefreshTokenRepository();
    const uow = mockUnitOfWork(users, organizations, members, refreshTokens);
    const hasher = mockPasswordHasher();
    const tokenService = mockTokenService();
    const opaqueHasher = mockOpaqueTokenHasher();
    const useCase = new SignupUseCase(uow, hasher, tokenService, opaqueHasher);

    const result = await useCase.execute(VALID);

    expect(result.user.email).toBe('jane@example.com');
    expect(result.organization.slug).toBe('acme-inc');
    expect(result.member.role).toBe(Role.OWNER);
    expect(result.accessToken).toBe('access.jwt');
    expect(result.refreshToken).toBe('refresh.jwt');
    expect(users.save).toHaveBeenCalledTimes(1);
    expect(organizations.save).toHaveBeenCalledTimes(1);
    expect(members.save).toHaveBeenCalledTimes(1);
    expect(refreshTokens.save).toHaveBeenCalledTimes(1);
    expect(hasher.hash).toHaveBeenCalledWith('password12');
  });

  it('should throw UserAlreadyExistsError when email is taken', async () => {
    const existing = User.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440300' as UserId,
      email: 'jane@example.com',
      password: 'x',
      fullname: 'X',
      emailVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const users = mockUserRepository({
      findByEmail: jest.fn(async () => existing),
    });
    const organizations = mockOrganizationRepository();
    const members = mockMemberRepository();
    const refreshTokens = mockRefreshTokenRepository();
    const uow = mockUnitOfWork(users, organizations, members, refreshTokens);
    const useCase = new SignupUseCase(
      uow,
      mockPasswordHasher(),
      mockTokenService(),
      mockOpaqueTokenHasher(),
    );

    await expect(useCase.execute(VALID)).rejects.toThrow(
      UserAlreadyExistsError,
    );
    expect(users.save).not.toHaveBeenCalled();
    expect(organizations.save).not.toHaveBeenCalled();
  });

  it('should use slug suffix when base slug is taken', async () => {
    const users = mockUserRepository();
    const taken = Organization.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440301' as OrganizationId,
      name: 'Other',
      slug: 'acme-inc',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const organizations = mockOrganizationRepository({
      findBySlug: jest.fn(async (slug: Slug) =>
        slug.value === 'acme-inc' ? taken : null,
      ),
    });
    const members = mockMemberRepository();
    const refreshTokens = mockRefreshTokenRepository();
    const uow = mockUnitOfWork(users, organizations, members, refreshTokens);
    const useCase = new SignupUseCase(
      uow,
      mockPasswordHasher(),
      mockTokenService(),
      mockOpaqueTokenHasher(),
    );

    const result = await useCase.execute(VALID);

    expect(result.organization.slug).toBe('acme-inc-1');
  });

  it('should throw InvalidEmailError for bad email before transaction', async () => {
    const users = mockUserRepository();
    const organizations = mockOrganizationRepository();
    const members = mockMemberRepository();
    const refreshTokens = mockRefreshTokenRepository();
    const uow = mockUnitOfWork(users, organizations, members, refreshTokens);
    const useCase = new SignupUseCase(
      uow,
      mockPasswordHasher(),
      mockTokenService(),
      mockOpaqueTokenHasher(),
    );

    await expect(
      useCase.execute({ ...VALID, email: 'not-an-email' }),
    ).rejects.toThrow(InvalidEmailError);

    expect(uow.execute).not.toHaveBeenCalled();
  });

  it('should throw SlugAllocationError when no slug can be allocated', async () => {
    const taken = Organization.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440301' as OrganizationId,
      name: 'Other',
      slug: 'acme-inc',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const users = mockUserRepository();
    const organizations = mockOrganizationRepository({
      findBySlug: jest.fn(async () => taken),
    });
    const members = mockMemberRepository();
    const refreshTokens = mockRefreshTokenRepository();
    const uow = mockUnitOfWork(users, organizations, members, refreshTokens);
    const useCase = new SignupUseCase(
      uow,
      mockPasswordHasher(),
      mockTokenService(),
      mockOpaqueTokenHasher(),
    );

    await expect(useCase.execute(VALID)).rejects.toThrow(SlugAllocationError);

    expect(organizations.findBySlug).toHaveBeenCalled();
  });
});
