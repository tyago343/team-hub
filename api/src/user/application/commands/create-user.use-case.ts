import { Injectable } from '@nestjs/common';
import { type UserPrimitives, User } from '../../domain/User';
import { Email } from '../../domain/email.vo';
import { UserAlreadyExistsError } from '../../domain/user.errors';
import type { UserRepository } from '../../domain/user.repository';
import type { PasswordHasher } from '../../domain/password-hasher.port';

interface CreateUserCommand {
  email: string;
  password: string;
  fullname: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserPrimitives> {
    const email = Email.create(command.email);

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new UserAlreadyExistsError(command.email);
    }

    const hashedPassword = await this.passwordHasher.hash(command.password);

    const user = User.create({
      email,
      password: hashedPassword,
      fullname: command.fullname,
    });

    await this.userRepository.save(user);

    return user.toPrimitives();
  }
}
