import { Injectable } from '@nestjs/common';
import { type UserPrimitives } from '../../domain/User';
import { Email } from '../../domain/email.vo';
import { UserId } from '../../domain/user-id';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../domain/user.errors';
import { PasswordHasher } from '../../domain/password-hasher.port';
import { UserRepository } from '../../domain/user.repository';

interface UpdateUserCommand {
  id: string;
  email?: string;
  password?: string;
  fullname?: string;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserPrimitives> {
    const user = await this.userRepository.findById(command.id as UserId);
    if (!user) {
      throw new UserNotFoundError(command.id);
    }

    if (command.email !== undefined) {
      const newEmail = Email.create(command.email);
      if (!newEmail.equals(user.email)) {
        const existing = await this.userRepository.findByEmail(newEmail);
        if (existing && existing.id !== user.id) {
          throw new UserAlreadyExistsError(command.email);
        }
        user.changeEmail(newEmail);
      }
    }

    if (command.password !== undefined) {
      const hashed = await this.passwordHasher.hash(command.password);
      user.changePassword(hashed);
    }

    if (command.fullname !== undefined) {
      user.changeFullname(command.fullname);
    }

    await this.userRepository.update(user);

    return user.toPrimitives();
  }
}
