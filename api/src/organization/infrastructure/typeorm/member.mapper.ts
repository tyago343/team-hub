import { Member } from '../../domain/Member';
import { MemberEntity } from './member.entity';

export class MemberMapper {
  static toDomain(entity: MemberEntity): Member {
    return Member.fromPrimitives({
      id: entity.id,
      userId: entity.userId,
      organizationId: entity.organizationId,
      role: entity.role,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toEntity(member: Member): MemberEntity {
    const p = member.toPrimitives();
    const entity = new MemberEntity();
    entity.id = p.id;
    entity.userId = p.userId;
    entity.organizationId = p.organizationId;
    entity.role = p.role;
    entity.createdAt = p.createdAt;
    entity.updatedAt = p.updatedAt;
    return entity;
  }
}
