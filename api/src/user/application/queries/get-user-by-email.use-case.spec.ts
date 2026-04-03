/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
import { GetUserByEmailUseCase } from './get-user-by-email.use-case';
import { UserRepository } from '../../domain/User.repository';
import { InvalidEmailError } from '../../domain/User.errors';
import { User } from '../../domain/User';

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

const STORED_USER = User.fromPrimitives({
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'jane@example.com',
  password: 'hashed_pw',
  fullname: 'Jane Doe',
  emailVerifiedAt: null,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
});

describe('GetUserByEmailUseCase', () => {
  it('should return user primitives when user exists', async () => {
    const repo = mockUserRepository({
      findByEmail: jest.fn(async () => STORED_USER),
    });
    const useCase = new GetUserByEmailUseCase(repo);

    const result = await useCase.execute({ email: 'jane@example.com' });

    expect(result).toEqual(STORED_USER.toPrimitives());
    expect(repo.findByEmail).toHaveBeenCalledTimes(1);
  });

  it('should return null when user does not exist', async () => {
    const repo = mockUserRepository();
    const useCase = new GetUserByEmailUseCase(repo);

    const result = await useCase.execute({ email: 'nobody@example.com' });

    expect(result).toBeNull();
  });

  it('should throw InvalidEmailError for malformed email', async () => {
    const repo = mockUserRepository();
    const useCase = new GetUserByEmailUseCase(repo);

    await expect(useCase.execute({ email: 'not-an-email' })).rejects.toThrow(
      InvalidEmailError,
    );
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });
});
