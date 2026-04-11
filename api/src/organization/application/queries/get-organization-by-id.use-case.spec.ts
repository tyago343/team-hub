/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
import { GetOrganizationByIdUseCase } from './get-organization-by-id.use-case';
import { Organization } from '../../domain/Organization';
import { OrganizationRepository } from '../../domain/organization.repository';
import type { OrganizationId } from '../../domain/organization-id';

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

const ORG_ID = '550e8400-e29b-41d4-a716-446655440100' as OrganizationId;

describe('GetOrganizationByIdUseCase', () => {
  it('returns primitives when found', async () => {
    const org = Organization.fromPrimitives({
      id: ORG_ID,
      name: 'Acme',
      slug: 'acme',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const repo = mockOrganizationRepository({
      findById: jest.fn(async () => org),
    });
    const useCase = new GetOrganizationByIdUseCase(repo);

    const result = await useCase.execute({ id: ORG_ID });

    expect(result).not.toBeNull();
    expect(result?.slug).toBe('acme');
    expect(repo.findById).toHaveBeenCalledWith(ORG_ID);
  });

  it('returns null when not found', async () => {
    const repo = mockOrganizationRepository();
    const useCase = new GetOrganizationByIdUseCase(repo);

    const result = await useCase.execute({ id: ORG_ID });

    expect(result).toBeNull();
  });
});
