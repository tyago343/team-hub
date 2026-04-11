import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { OrganizationId } from '../../domain/organization-id';
import type { MemberId } from '../../domain/member-id';
import { Member } from '../../domain/Member';
import { MemberRepository } from '../../domain/member.repository';
import type { UserId } from '../../../user/domain/user-id';
import { MemberEntity } from './member.entity';
import { MemberMapper } from './member.mapper';

@Injectable()
export class MemberRepositoryImpl extends MemberRepository {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly ormRepository: Repository<MemberEntity>,
  ) {
    super();
  }

  async save(member: Member): Promise<Member> {
    const entity = MemberMapper.toEntity(member);
    await this.ormRepository.save(entity);
    return member;
  }

  async findById(id: MemberId): Promise<Member | null> {
    const row = await this.ormRepository.findOne({ where: { id } });
    return row ? MemberMapper.toDomain(row) : null;
  }

  async findByUserId(userId: UserId): Promise<Member | null> {
    const rows = await this.ormRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
      take: 1,
    });
    const row = rows[0];
    return row ? MemberMapper.toDomain(row) : null;
  }

  async findByUserAndOrganization(
    userId: UserId,
    organizationId: OrganizationId,
  ): Promise<Member | null> {
    const row = await this.ormRepository.findOne({
      where: { userId, organizationId },
    });
    return row ? MemberMapper.toDomain(row) : null;
  }

  async delete(id: MemberId): Promise<void> {
    await this.ormRepository.delete({ id });
  }

  async update(member: Member): Promise<Member> {
    const entity = MemberMapper.toEntity(member);
    await this.ormRepository.save(entity);
    return member;
  }
}
