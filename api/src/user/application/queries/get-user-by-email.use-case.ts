import { UserPrimitives } from '../../domain/User';
import { UserRepository } from '../../domain/User.repository';
import { Email } from '../../domain/Email.vo';

interface GetUserByEmailQuery {
  email: string;
}

export class GetUserByEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByEmailQuery): Promise<UserPrimitives | null> {
    const user = await this.userRepository.findByEmail(
      Email.create(query.email),
    );

    if (!user) {
      return null;
    }

    return user.toPrimitives();
  }
}
