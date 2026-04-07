/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { UpdateOrganizationUseCase } from './update-organization.use-case';
import { Organization } from '../../domain/Organization';
import {
  OrganizationNotFoundError,
  OrganizationSlugAlreadyExistsError,
} from '../../domain/organization.errors';
import type { OrganizationId } from '../../domain/organization-id';
import { OrganizationRepository } from '../../domain/organization.repository';
import { Slug } from '../../domain/slug.vo';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440100' as OrganizationId;

function existingOrg(): Organization {
  return Organization.fromPrimitives({
    id: ORG_ID,
    name: 'Old',
    slug: 'old-slug',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  });
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

describe('UpdateOrganizationUseCase', () => {
  it('should rename organization', async () => {
    const org = existingOrg();
    const repo = mockOrganizationRepository({
      findById: jest.fn(async () => org),
    });
    const useCase = new UpdateOrganizationUseCase(repo);

    const result = await useCase.execute({ id: ORG_ID, name: 'New Name' });

    expect(result.name).toBe('New Name');
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should change slug when not taken', async () => {
    const org = existingOrg();
    const repo = mockOrganizationRepository({
      findById: jest.fn(async () => org),
      findBySlug: jest.fn(async () => null),
    });
    const useCase = new UpdateOrganizationUseCase(repo);

    const result = await useCase.execute({
      id: ORG_ID,
      slug: 'new-slug',
    });

    expect(result.slug).toBe('new-slug');
  });

  it('should throw OrganizationNotFoundError when missing', async () => {
    const repo = mockOrganizationRepository({
      findById: jest.fn(async () => null),
    });
    const useCase = new UpdateOrganizationUseCase(repo);

    await expect(useCase.execute({ id: ORG_ID, name: 'X' })).rejects.toThrow(
      OrganizationNotFoundError,
    );
  });

  it('should throw OrganizationSlugAlreadyExistsError when slug used by other org', async () => {
    const org = existingOrg();
    const other = Organization.fromPrimitives({
      id: '550e8400-e29b-41d4-a716-446655440101' as OrganizationId,
      name: 'Other',
      slug: 'taken',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo = mockOrganizationRepository({
      findById: jest.fn(async () => org),
      findBySlug: jest.fn(async (slug: Slug) =>
        slug.value === 'taken' ? other : null,
      ),
    });
    const useCase = new UpdateOrganizationUseCase(repo);

    await expect(
      useCase.execute({ id: ORG_ID, slug: 'taken' }),
    ).rejects.toThrow(OrganizationSlugAlreadyExistsError);
  });
});
