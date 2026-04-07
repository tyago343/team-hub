/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { CreateOrganizationUseCase } from './create-organization.use-case';
import { Organization } from '../../domain/Organization';
import { OrganizationSlugAlreadyExistsError } from '../../domain/organization.errors';
import type { OrganizationId } from '../../domain/organization-id';
import { OrganizationRepository } from '../../domain/organization.repository';

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

describe('CreateOrganizationUseCase', () => {
  it('should create organization with auto slug from name', async () => {
    const repo = mockOrganizationRepository();
    const useCase = new CreateOrganizationUseCase(repo);

    const result = await useCase.execute({ name: 'Acme Inc' });

    expect(result.name).toBe('Acme Inc');
    expect(result.slug).toBe('acme-inc');
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.findBySlug).toHaveBeenCalled();
  });

  it('should use explicit slug when provided', async () => {
    const repo = mockOrganizationRepository();
    const useCase = new CreateOrganizationUseCase(repo);

    const result = await useCase.execute({
      name: 'X',
      slug: 'custom-slug',
    });

    expect(result.slug).toBe('custom-slug');
  });

  it('should throw OrganizationSlugAlreadyExistsError when slug taken', async () => {
    const existing = Organization.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440099' as OrganizationId,
      name: 'Other',
      slug: 'acme-inc',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo = mockOrganizationRepository({
      findBySlug: jest.fn(async () => existing),
    });
    const useCase = new CreateOrganizationUseCase(repo);

    await expect(useCase.execute({ name: 'Acme Inc' })).rejects.toThrow(
      OrganizationSlugAlreadyExistsError,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });
});
