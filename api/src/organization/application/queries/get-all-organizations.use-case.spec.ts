/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { GetAllOrganizationsUseCase } from './get-all-organizations.use-case';
import { Organization } from '../../domain/Organization';
import { OrganizationRepository } from '../../domain/organization.repository';

function mockOrganizationRepository(
  overrides: Partial<OrganizationRepository> = {},
): OrganizationRepository {
  return {
    save: jest.fn(async (o: Organization) => o),
    findById: jest.fn(async () => null),
    findBySlug: jest.fn(async () => null),
    findAll: jest.fn(async () => ({ data: [], total: 0 })),
    delete: jest.fn(async () => {}),
    update: jest.fn(async (o: Organization) => o),
    ...overrides,
  };
}

const ORG_A = Organization.fromPrimitives({
  id: '550e8400-e29b-41d4-a716-446655440100',
  name: 'Acme',
  slug: 'acme',
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('GetAllOrganizationsUseCase', () => {
  it('should return paginated primitives and meta', async () => {
    const repo = mockOrganizationRepository({
      findAll: jest.fn(async () => ({ data: [ORG_A], total: 1 })),
    });
    const useCase = new GetAllOrganizationsUseCase(repo);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].slug).toBe('acme');
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should set totalPages to 0 when no organizations', async () => {
    const repo = mockOrganizationRepository();
    const useCase = new GetAllOrganizationsUseCase(repo);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.meta.totalPages).toBe(0);
    expect(result.data).toHaveLength(0);
  });
});
