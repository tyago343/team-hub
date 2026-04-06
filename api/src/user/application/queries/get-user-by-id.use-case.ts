import { Injectable } from '@nestjs/common';
import { UserPrimitives } from '../../domain/User';
import { UserRepository } from '../../domain/user.repository';
import { UserId } from '../../domain/user-id';

interface GetUserByIdQuery {
  id: string;
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByIdQuery): Promise<UserPrimitives | null> {
    const user = await this.userRepository.findById(query.id as UserId);

    if (!user) {
      return null;
    }

    return user.toPrimitives();
  }
}
