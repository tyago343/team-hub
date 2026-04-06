/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { GetAllUsersUseCase } from './get-all-users.use-case';
import { UserRepository } from '../../domain/user.repository';
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

const USER_A = User.fromPrimitives({
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'a@example.com',
  password: 'h',
  fullname: 'A',
  emailVerifiedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('GetAllUsersUseCase', () => {
  it('should return paginated primitives and meta', async () => {
    const repo = mockUserRepository({
      findAll: jest.fn(async () => ({ data: [USER_A], total: 1 })),
    });
    const useCase = new GetAllUsersUseCase(repo);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].email).toBe('a@example.com');
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should set totalPages to 0 when no users', async () => {
    const repo = mockUserRepository();
    const useCase = new GetAllUsersUseCase(repo);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.meta.totalPages).toBe(0);
    expect(result.data).toHaveLength(0);
  });
});
