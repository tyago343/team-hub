import { User } from '../../domain/User';
import { UserEntity } from './user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return User.fromPrimitives({
      id: entity.id,
      email: entity.email,
      password: entity.password,
      fullname: entity.fullname,
      emailVerifiedAt: entity.emailVerifiedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toEntity(user: User): UserEntity {
    const p = user.toPrimitives();
    const entity = new UserEntity();
    entity.id = p.id;
    entity.email = p.email;
    entity.password = p.password;
    entity.fullname = p.fullname;
    entity.emailVerifiedAt = p.emailVerifiedAt;
    entity.createdAt = p.createdAt;
    entity.updatedAt = p.updatedAt;
    return entity;
  }
}
