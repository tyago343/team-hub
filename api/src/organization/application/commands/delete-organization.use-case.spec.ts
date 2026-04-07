/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { DeleteOrganizationUseCase } from './delete-organization.use-case';
import { Organization } from '../../domain/Organization';
import { OrganizationNotFoundError } from '../../domain/organization.errors';
import type { OrganizationId } from '../../domain/organization-id';
import { OrganizationRepository } from '../../domain/organization.repository';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440200' as OrganizationId;

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

describe('DeleteOrganizationUseCase', () => {
  it('should delete when organization exists', async () => {
    const org = Organization.fromPrimitives({
      id: ORG_ID,
      name: 'X',
      slug: 'x',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo = mockOrganizationRepository({
      findById: jest.fn(async () => org),
    });
    const useCase = new DeleteOrganizationUseCase(repo);

    await useCase.execute({ id: ORG_ID });

    expect(repo.delete).toHaveBeenCalledWith(ORG_ID);
  });

  it('should throw OrganizationNotFoundError when missing', async () => {
    const repo = mockOrganizationRepository({
      findById: jest.fn(async () => null),
    });
    const useCase = new DeleteOrganizationUseCase(repo);

    await expect(useCase.execute({ id: ORG_ID })).rejects.toThrow(
      OrganizationNotFoundError,
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
