import { Module } from '@nestjs/common';
import { UserController } from './http/user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [],
})
export class UserPresenters {}
