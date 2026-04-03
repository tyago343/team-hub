/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { CreateUserUseCase } from './create-user.use-case';
import { UserRepository } from '../../domain/User.repository';
import { PasswordHasher } from '../../domain/PasswordHasher.port';
import { HashedPassword } from '../../domain/HashedPassword.type';
import { UserAlreadyExistsError } from '../../domain/User.errors';
import { InvalidEmailError } from '../../domain/User.errors';
import User from '../../domain/User';

const HASHED = 'hashed_value' as HashedPassword;

function mockUserRepository(
  overrides: Partial<UserRepository> = {},
): UserRepository {
  return {
    save: jest.fn(async (user: User) => user),
    findByEmail: jest.fn(async () => null),
    findById: jest.fn(async () => null),
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

const VALID_COMMAND = {
  email: 'new@example.com',
  password: 'plaintext123',
  fullname: 'Jane Doe',
};

describe('CreateUserUseCase', () => {
  it('should create a user and return its primitives', async () => {
    const repo = mockUserRepository();
    const hasher = mockPasswordHasher();
    const useCase = new CreateUserUseCase(repo, hasher);

    const result = await useCase.execute(VALID_COMMAND);

    expect(result.email).toBe('new@example.com');
    expect(result.fullname).toBe('Jane Doe');
    expect(result.password).toBe(HASHED);
    expect(result.id).toBeDefined();
    expect(result.emailVerifiedAt).toBeNull();
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(hasher.hash).toHaveBeenCalledWith('plaintext123');
  });

  it('should throw UserAlreadyExistsError if email is taken', async () => {
    const existingUser = User.fromPrimitives({
      id: 'existing-id',
      email: 'new@example.com',
      password: 'hash',
      fullname: 'Existing',
      emailVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo = mockUserRepository({
      findByEmail: jest.fn(async () => existingUser),
    });
    const hasher = mockPasswordHasher();
    const useCase = new CreateUserUseCase(repo, hasher);

    await expect(useCase.execute(VALID_COMMAND)).rejects.toThrow(
      UserAlreadyExistsError,
    );
    expect(repo.save).not.toHaveBeenCalled();
    expect(hasher.hash).not.toHaveBeenCalled();
  });

  it('should throw InvalidEmailError for malformed email', async () => {
    const repo = mockUserRepository();
    const hasher = mockPasswordHasher();
    const useCase = new CreateUserUseCase(repo, hasher);

    await expect(
      useCase.execute({ ...VALID_COMMAND, email: 'not-an-email' }),
    ).rejects.toThrow(InvalidEmailError);
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });

  it('should hash the password before creating the user', async () => {
    const repo = mockUserRepository();
    const hasher = mockPasswordHasher();
    const useCase = new CreateUserUseCase(repo, hasher);

    const result = await useCase.execute(VALID_COMMAND);

    expect(hasher.hash).toHaveBeenCalledWith('plaintext123');
    expect(result.password).toBe(HASHED);
  });

  it('should check email uniqueness before hashing', async () => {
    const callOrder: string[] = [];
    const repo = mockUserRepository({
      findByEmail: jest.fn(async () => {
        callOrder.push('findByEmail');
        return User.fromPrimitives({
          id: 'id',
          email: 'new@example.com',
          password: 'hash',
          fullname: 'X',
          emailVerifiedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }),
    });
    const hasher = mockPasswordHasher({
      hash: jest.fn(async () => {
        callOrder.push('hash');
        return HASHED;
      }),
    });
    const useCase = new CreateUserUseCase(repo, hasher);

    await expect(useCase.execute(VALID_COMMAND)).rejects.toThrow(
      UserAlreadyExistsError,
    );
    expect(callOrder).toEqual(['findByEmail']);
  });
});
