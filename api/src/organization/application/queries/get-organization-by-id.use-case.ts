import { Injectable } from '@nestjs/common';
import { type OrganizationPrimitives } from '../../domain/Organization';
import type { OrganizationId } from '../../domain/organization-id';
import { OrganizationRepository } from '../../domain/organization.repository';

interface GetOrganizationByIdQuery {
  id: string;
}

@Injectable()
export class GetOrganizationByIdUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    query: GetOrganizationByIdQuery,
  ): Promise<OrganizationPrimitives | null> {
    const org = await this.organizationRepository.findById(
      query.id as OrganizationId,
    );
    return org ? org.toPrimitives() : null;
  }
}
