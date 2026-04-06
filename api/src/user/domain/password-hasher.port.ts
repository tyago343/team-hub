import { HashedPassword } from './hashed-password.type';

export abstract class PasswordHasher {
  abstract hash(plainPassword: string): Promise<HashedPassword>;
  abstract compare(
    plainPassword: string,
    hashed: HashedPassword,
  ): Promise<boolean>;
}
