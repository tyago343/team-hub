import { HashedPassword } from './HashedPassword.type';

export interface PasswordHasher {
  hash(plainPassword: string): Promise<HashedPassword>;
  compare(plainPassword: string, hashed: HashedPassword): Promise<boolean>;
}
