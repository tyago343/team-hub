import { UserPrimitives } from '../../domain/User';
import { type UserRepository } from '../../domain/user.repository';
import { Email } from '../../domain/email.vo';
import { Injectable } from '@nestjs/common';

interface GetUserByEmailQuery {
  email: string;
}
@Injectable()
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
