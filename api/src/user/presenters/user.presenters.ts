import { Module } from '@nestjs/common';
import { UserApplication } from '../application/user.application';
import { UserInfrastructure } from '../infrastructure/user.infrastructure';
import { UserController } from './http/user.controller';

@Module({
  imports: [UserApplication.withInfrastructure(UserInfrastructure)],
  controllers: [UserController],
  exports: [UserApplication],
})
export class UserPresenters {}
