import { Injectable } from '@nestjs/common';
import { type OrganizationPrimitives } from '../../domain/Organization';
import { OrganizationRepository } from '../../domain/organization.repository';
import { Slug } from '../../domain/slug.vo';

interface GetOrganizationBySlugQuery {
  slug: string;
}

@Injectable()
export class GetOrganizationBySlugUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    query: GetOrganizationBySlugQuery,
  ): Promise<OrganizationPrimitives | null> {
    const slug = Slug.create(query.slug.trim().toLowerCase());
    const org = await this.organizationRepository.findBySlug(slug);
    return org ? org.toPrimitives() : null;
  }
}
