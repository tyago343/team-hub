import { MemberRepository } from '../../organization/domain/member.repository';
import { OrganizationRepository } from '../../organization/domain/organization.repository';
import { UserRepository } from '../../user/domain/user.repository';

export interface TransactionalRepositories {
  users: UserRepository;
  organizations: OrganizationRepository;
  members: MemberRepository;
}

export abstract class UnitOfWork {
  abstract execute<T>(
    work: (repos: TransactionalRepositories) => Promise<T>,
  ): Promise<T>;
}
