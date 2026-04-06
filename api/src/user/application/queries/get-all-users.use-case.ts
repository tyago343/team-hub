import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../shared/types/pagination';
import type { UserPrimitives } from '../../domain/User';
import { UserRepository } from '../../domain/user.repository';

interface GetAllUsersQuery {
  page: number;
  limit: number;
}

@Injectable()
export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    query: GetAllUsersQuery,
  ): Promise<PaginatedResult<UserPrimitives>> {
    const { data, total } = await this.userRepository.findAll({
      page: query.page,
      limit: query.limit,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

    return {
      data: data.map((u) => u.toPrimitives()),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }
}
