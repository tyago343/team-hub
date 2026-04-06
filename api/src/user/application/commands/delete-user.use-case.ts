import { Injectable } from '@nestjs/common';
import { UserId } from '../../domain/user-id';
import { UserNotFoundError } from '../../domain/user.errors';
import { UserRepository } from '../../domain/user.repository';

interface DeleteUserCommand {
  id: string;
}

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.id as UserId);
    if (!user) {
      throw new UserNotFoundError(command.id);
    }

    await this.userRepository.delete(command.id as UserId);
  }
}
