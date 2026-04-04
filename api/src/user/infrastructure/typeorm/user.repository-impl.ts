/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRepository } from 'src/user/domain/user.repository';
import { Injectable } from '@nestjs/common';
import { Email } from 'src/user/domain/email.vo';
import { User } from 'src/user/domain/User';
import { UserId } from 'src/user/domain/user-id';

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  save(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }
  findByEmail(email: Email): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  findById(id: UserId): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
  delete(id: UserId): Promise<void> {
    throw new Error('Method not implemented.');
  }
  update(user: User): Promise<User> {
    throw new Error('Method not implemented.');
  }
}
