import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaginationOptions } from '../../../shared/types/pagination';
import { User } from '../../domain/User';
import { Email } from '../../domain/email.vo';
import { UserId } from '../../domain/user-id';
import { UserRepository } from '../../domain/user.repository';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly ormRepository: Repository<UserEntity>,
  ) {
    super();
  }

  private toDomain(entity: UserEntity): User {
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

  private toEntity(user: User): UserEntity {
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

  async save(user: User): Promise<User> {
    const entity = this.toEntity(user);
    await this.ormRepository.save(entity);
    return user;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.ormRepository.findOne({
      where: { email: email.value },
    });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: UserId): Promise<User | null> {
    const row = await this.ormRepository.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(
    options: PaginationOptions,
  ): Promise<{ data: User[]; total: number }> {
    const skip = (options.page - 1) * options.limit;
    const [entities, total] = await this.ormRepository.findAndCount({
      skip,
      take: options.limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data: entities.map((e) => this.toDomain(e)),
      total,
    };
  }

  async delete(id: UserId): Promise<void> {
    await this.ormRepository.delete({ id });
  }

  async update(user: User): Promise<User> {
    const entity = this.toEntity(user);
    await this.ormRepository.save(entity);
    return user;
  }
}
