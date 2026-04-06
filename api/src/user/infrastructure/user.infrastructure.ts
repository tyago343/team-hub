import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordHasher } from '../domain/password-hasher.port';
import { UserRepository } from '../domain/user.repository';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';
import { UserEntity } from './typeorm/user.entity';
import { UserRepositoryImpl } from './typeorm/user.repository-impl';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
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
