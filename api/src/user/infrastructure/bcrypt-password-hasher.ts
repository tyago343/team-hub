import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../domain/password-hasher.port';
import { HashedPassword } from '../domain/hashed-password.type';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  async hash(plainPassword: string): Promise<HashedPassword> {
    const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashed as HashedPassword;
  }

  async compare(
    plainPassword: string,
    hashed: HashedPassword,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashed);
  }
}
