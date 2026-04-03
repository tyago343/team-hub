import { Email } from '../../domain/Email.vo';
import User, { UserPrimitives } from '../../domain/User';
import { UserAlreadyExistsError } from '../../domain/User.errors';
import { UserRepository } from '../../domain/User.repository';
import { PasswordHasher } from '../../domain/PasswordHasher.port';

interface CreateUserCommand {
  email: string;
  password: string;
  fullname: string;
}

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
      email: command.email,
      password: hashedPassword,
      fullname: command.fullname,
    });

    await this.userRepository.save(user);

    return user.toPrimitives();
  }
}
