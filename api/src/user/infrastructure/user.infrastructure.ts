import { Module } from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { UserRepositoryImpl } from './typeorm/user.repository-impl';

@Module({
  imports: [],
  providers: [
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [],
})
export class UserInfrastructure {}
