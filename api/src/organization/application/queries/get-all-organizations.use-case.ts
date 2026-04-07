import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../shared/types/pagination';
import type { OrganizationPrimitives } from '../../domain/Organization';
import { OrganizationRepository } from '../../domain/organization.repository';

interface GetAllOrganizationsQuery {
  page: number;
  limit: number;
}

@Injectable()
export class GetAllOrganizationsUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    query: GetAllOrganizationsQuery,
  ): Promise<PaginatedResult<OrganizationPrimitives>> {
    const { data, total } = await this.organizationRepository.findAll({
      page: query.page,
      limit: query.limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

    return {
      data: data.map((o) => o.toPrimitives()),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }
}
