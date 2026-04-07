import type { OrganizationId } from './organization-id';
import type { MemberId } from './member-id';
import { Member } from './Member';
import type { UserId } from '../../user/domain/user-id';

export abstract class MemberRepository {
  abstract save(member: Member): Promise<Member>;
  abstract findById(id: MemberId): Promise<Member | null>;
  abstract findByUserAndOrganization(
    userId: UserId,
    organizationId: OrganizationId,
  ): Promise<Member | null>;
  abstract delete(id: MemberId): Promise<void>;
  abstract update(member: Member): Promise<Member>;
}
