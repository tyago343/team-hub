/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { GetOrganizationBySlugUseCase } from './get-organization-by-slug.use-case';
import { Organization } from '../../domain/Organization';
import { OrganizationRepository } from '../../domain/organization.repository';
import { InvalidSlugError } from '../../domain/organization.errors';

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

describe('GetOrganizationBySlugUseCase', () => {
  it('returns primitives when found', async () => {
    const org = Organization.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440100',
      name: 'Acme',
      slug: 'acme',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo = mockOrganizationRepository({
      findBySlug: jest.fn(async () => org),
    });
    const useCase = new GetOrganizationBySlugUseCase(repo);

    const result = await useCase.execute({ slug: 'acme' });

    expect(result).not.toBeNull();
    expect(result?.slug).toBe('acme');
    expect(repo.findBySlug).toHaveBeenCalled();
  });

  it('returns null when not found', async () => {
    const repo = mockOrganizationRepository();
    const useCase = new GetOrganizationBySlugUseCase(repo);

    const result = await useCase.execute({ slug: 'missing' });

    expect(result).toBeNull();
  });

  it('throws InvalidSlugError for invalid slug', async () => {
    const repo = mockOrganizationRepository();
    const useCase = new GetOrganizationBySlugUseCase(repo);

    await expect(useCase.execute({ slug: 'Invalid Slug!' })).rejects.toThrow(
      InvalidSlugError,
    );
    expect(repo.findBySlug).not.toHaveBeenCalled();
  });
});
