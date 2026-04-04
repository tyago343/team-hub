import { Module } from '@nestjs/common';
import { UserPresenters } from './presenters/user.presenters';
import { UserApplication } from './application/user.application';
import { UserInfrastructure } from './infrastructure/user.infrastructure';

@Module({
  imports: [
    UserApplication.withInfrastructure(UserInfrastructure),
    UserPresenters,
  ],
  exports: [UserApplication],
})
export class UserModule {}
