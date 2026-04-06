import { Module } from '@nestjs/common';
import { UserPresenters } from './presenters/user.presenters';

@Module({
  imports: [UserPresenters],
  exports: [UserPresenters],
})
export class UserModule {}
