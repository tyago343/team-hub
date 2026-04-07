import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaginationOptions } from '../../../shared/types/pagination';
import { User } from '../../domain/User';
import { Email } from '../../domain/email.vo';
import { UserId } from '../../domain/user-id';
import { UserRepository } from '../../domain/user.repository';
import { UserEntity } from './user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly ormRepository: Repository<UserEntity>,
  ) {
    super();
  }

  async save(user: User): Promise<User> {
    const entity = UserMapper.toEntity(user);
    await this.ormRepository.save(entity);
    return user;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.ormRepository.findOne({
      where: { email: email.value },
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findById(id: UserId): Promise<User | null> {
    const row = await this.ormRepository.findOne({ where: { id } });
    return row ? UserMapper.toDomain(row) : null;
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
      data: entities.map((e) => UserMapper.toDomain(e)),
      total,
    };
  }

  async delete(id: UserId): Promise<void> {
    await this.ormRepository.delete({ id });
  }

  async update(user: User): Promise<User> {
    const entity = UserMapper.toEntity(user);
    await this.ormRepository.save(entity);
    return user;
  }
}
