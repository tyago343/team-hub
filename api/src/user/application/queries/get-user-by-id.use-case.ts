import { UserPrimitives } from '../../domain/User';
import { UserRepository } from '../../domain/User.repository';
import { UserId } from '../../domain/UserId.type';

interface GetUserByIdQuery {
  id: string;
}

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
