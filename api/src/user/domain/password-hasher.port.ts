import { HashedPassword } from './hashed-password.type';

export interface PasswordHasher {
  hash(plainPassword: string): Promise<HashedPassword>;
  compare(plainPassword: string, hashed: HashedPassword): Promise<boolean>;
}
