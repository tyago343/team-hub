import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MemberRepositoryImpl } from '../../organization/infrastructure/typeorm/member.repository-impl';
import { MemberEntity } from '../../organization/infrastructure/typeorm/member.entity';
import { OrganizationRepositoryImpl } from '../../organization/infrastructure/typeorm/organization.repository-impl';
import { OrganizationEntity } from '../../organization/infrastructure/typeorm/organization.entity';
import { UserRepositoryImpl } from '../../user/infrastructure/typeorm/user.repository-impl';
import { UserEntity } from '../../user/infrastructure/typeorm/user.entity';
import {
  type TransactionalRepositories,
  UnitOfWork,
} from '../ports/unit-of-work';

@Injectable()
export class TypeOrmUnitOfWork extends UnitOfWork {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async execute<T>(
    work: (repos: TransactionalRepositories) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const users = new UserRepositoryImpl(manager.getRepository(UserEntity));
      const organizations = new OrganizationRepositoryImpl(
        manager.getRepository(OrganizationEntity),
      );
      const members = new MemberRepositoryImpl(
        manager.getRepository(MemberEntity),
      );

      return work({ users, organizations, members });
    });
  }
}
