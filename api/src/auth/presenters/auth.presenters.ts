import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmUnitOfWork } from '../../shared/infrastructure/typeorm-unit-of-work';
import { UnitOfWork } from '../../shared/ports/unit-of-work';
import { OrganizationInfrastructure } from '../../organization/infrastructure/organization.infrastructure';
import { UserInfrastructure } from '../../user/infrastructure/user.infrastructure';
import { LoginUseCase } from '../application/commands/login.use-case';
import { LogoutUseCase } from '../application/commands/logout.use-case';
import { RefreshTokenUseCase } from '../application/commands/refresh-token.use-case';
import { SignupUseCase } from '../application/commands/signup.use-case';
import { AuthInfrastructureModule } from '../infrastructure/auth.infrastructure.module';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { AuthController } from './http/auth.controller';

@Module({
  imports: [
    UserInfrastructure,
    OrganizationInfrastructure,
    AuthInfrastructureModule,
  ],
  controllers: [AuthController],
  providers: [
    SignupUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    { provide: UnitOfWork, useClass: TypeOrmUnitOfWork },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [SignupUseCase, LoginUseCase, RefreshTokenUseCase, LogoutUseCase],
})
export class AuthPresenters {}
