/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { UpdateUserUseCase } from './update-user.use-case';
import { UserRepository } from '../../domain/user.repository';
import { PasswordHasher } from '../../domain/password-hasher.port';
import { HashedPassword } from '../../domain/hashed-password.type';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../domain/user.errors';
import { User } from '../../domain/User';

const HASHED = 'hashed_value' as HashedPassword;

function mockUserRepository(
  overrides: Partial<UserRepository> = {},
): UserRepository {
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

function mockPasswordHasher(
  overrides: Partial<PasswordHasher> = {},
): PasswordHasher {
  return {
    hash: jest.fn(async () => HASHED),
    compare: jest.fn(async () => true),
    ...overrides,
  };
}

const STORED_USER = User.fromPrimitives({
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'jane@example.com',
  password: 'hashed_pw',
  fullname: 'Jane Doe',
  emailVerifiedAt: null,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
});

describe('UpdateUserUseCase', () => {
  it('should throw UserNotFoundError when user does not exist', async () => {
    const repo = mockUserRepository();
    const hasher = mockPasswordHasher();
    const useCase = new UpdateUserUseCase(repo, hasher);

    await expect(
      useCase.execute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        fullname: 'X',
      }),
    ).rejects.toThrow(UserNotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should update fullname and persist', async () => {
    const repo = mockUserRepository({
      findById: jest.fn(async () => STORED_USER),
    });
    const hasher = mockPasswordHasher();
    const useCase = new UpdateUserUseCase(repo, hasher);

    const result = await useCase.execute({
      id: '550e8400-e29b-41d4-a716-446655440000',
      fullname: 'Updated Name',
    });

    expect(result.fullname).toBe('Updated Name');
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(hasher.hash).not.toHaveBeenCalled();
  });

  it('should hash password when provided', async () => {
    const repo = mockUserRepository({
      findById: jest.fn(async () => STORED_USER),
    });
    const hasher = mockPasswordHasher();
    const useCase = new UpdateUserUseCase(repo, hasher);

    const result = await useCase.execute({
      id: '550e8400-e29b-41d4-a716-446655440000',
      password: 'newsecret12',
    });

    expect(hasher.hash).toHaveBeenCalledWith('newsecret12');
    expect(result.password).toBe(HASHED);
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should throw UserAlreadyExistsError when email is taken by another user', async () => {
    const other = User.fromPrimitives({
      id: '660e8400-e29b-41d4-a716-446655440001',
      email: 'other@example.com',
      password: 'x',
      fullname: 'Other',
      emailVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo = mockUserRepository({
      findById: jest.fn(async () => STORED_USER),
      findByEmail: jest.fn(async () => other),
    });
    const useCase = new UpdateUserUseCase(repo, mockPasswordHasher());

    await expect(
      useCase.execute({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'other@example.com',
      }),
    ).rejects.toThrow(UserAlreadyExistsError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should allow changing email when not taken', async () => {
    const repo = mockUserRepository({
      findById: jest.fn(async () => STORED_USER),
      findByEmail: jest.fn(async () => null),
    });
    const useCase = new UpdateUserUseCase(repo, mockPasswordHasher());

    const result = await useCase.execute({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'new@example.com',
    });

    expect(result.email).toBe('new@example.com');
    expect(repo.update).toHaveBeenCalledTimes(1);
  });
});
