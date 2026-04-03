import User from './User';
import { Email } from './Email.vo';
import { UserId } from './UserId.type';

export interface UserRepository {
  save(user: User): Promise<User>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  delete(id: UserId): Promise<void>;
  update(user: User): Promise<User>;
}
