import type { PaginationOptions } from '../../shared/types/pagination';
import type { OrganizationId } from './organization-id';
import { Organization } from './Organization';
import { Slug } from './slug.vo';

export abstract class OrganizationRepository {
  abstract save(organization: Organization): Promise<Organization>;
  abstract findById(id: OrganizationId): Promise<Organization | null>;
  abstract findBySlug(slug: Slug): Promise<Organization | null>;
  abstract findAll(
    options: PaginationOptions,
  ): Promise<{ data: Organization[]; total: number }>;
  abstract delete(id: OrganizationId): Promise<void>;
  abstract update(organization: Organization): Promise<Organization>;
}
