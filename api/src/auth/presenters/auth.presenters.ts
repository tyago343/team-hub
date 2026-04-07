import { Module } from '@nestjs/common';
import { TypeOrmUnitOfWork } from '../../shared/infrastructure/typeorm-unit-of-work';
import { UnitOfWork } from '../../shared/ports/unit-of-work';
import { UserInfrastructure } from '../../user/infrastructure/user.infrastructure';
import { SignupUseCase } from '../application/commands/signup.use-case';
import { AuthController } from './http/auth.controller';

@Module({
  imports: [UserInfrastructure],
  controllers: [AuthController],
  providers: [
    SignupUseCase,
    { provide: UnitOfWork, useClass: TypeOrmUnitOfWork },
  ],
  exports: [SignupUseCase],
})
export class AuthPresenters {}
