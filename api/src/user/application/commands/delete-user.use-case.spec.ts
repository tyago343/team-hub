/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { DeleteUserUseCase } from './delete-user.use-case';
import { UserRepository } from '../../domain/user.repository';
import { UserNotFoundError } from '../../domain/user.errors';
import { User } from '../../domain/User';

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

const STORED_USER = User.fromPrimitives({
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'jane@example.com',
  password: 'hashed_pw',
  fullname: 'Jane Doe',
  emailVerifiedAt: null,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
});

describe('DeleteUserUseCase', () => {
  it('should throw UserNotFoundError when user does not exist', async () => {
    const repo = mockUserRepository();
    const useCase = new DeleteUserUseCase(repo);

    await expect(
      useCase.execute({ id: '550e8400-e29b-41d4-a716-446655440000' }),
    ).rejects.toThrow(UserNotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should delete when user exists', async () => {
    const repo = mockUserRepository({
      findById: jest.fn(async () => STORED_USER),
    });
    const useCase = new DeleteUserUseCase(repo);

    await useCase.execute({ id: '550e8400-e29b-41d4-a716-446655440000' });

    expect(repo.delete).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });
});
