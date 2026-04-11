import { Module } from '@nestjs/common';
import { AuthInfrastructureModule } from '../../auth/infrastructure/auth.infrastructure.module';
import { UserApplication } from '../application/user.application';
import { UserInfrastructure } from '../infrastructure/user.infrastructure';
import { UserController } from './http/user.controller';

@Module({
  imports: [
    AuthInfrastructureModule,
    UserApplication.withInfrastructure(UserInfrastructure),
  ],
  controllers: [UserController],
  exports: [UserApplication],
})
export class UserPresenters {}
