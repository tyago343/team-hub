import type { PaginationOptions } from '../../shared/types/pagination';
import { User } from './User';
import { Email } from './email.vo';
import { UserId } from './user-id';

export abstract class UserRepository {
  abstract save(user: User): Promise<User>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract findById(id: UserId): Promise<User | null>;
  abstract findAll(
    options: PaginationOptions,
  ): Promise<{ data: User[]; total: number }>;
  abstract delete(id: UserId): Promise<void>;
  abstract update(user: User): Promise<User>;
}
