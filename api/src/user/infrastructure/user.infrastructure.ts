import { Module } from '@nestjs/common';
import { PasswordHasher } from '../domain/password-hasher.port';
import { UserRepository } from '../domain/user.repository';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';
import { UserRepositoryImpl } from './typeorm/user.repository-impl';

@Module({
  imports: [],
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: PasswordHasher,
      useClass: BcryptPasswordHasher,
    },
  ],
  exports: [UserRepository, PasswordHasher],
})
export class UserInfrastructure {}
