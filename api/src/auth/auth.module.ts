import { Module } from '@nestjs/common';
import { AuthPresenters } from './presenters/auth.presenters';

@Module({
  imports: [AuthPresenters],
  exports: [AuthPresenters],
})
export class AuthModule {}
