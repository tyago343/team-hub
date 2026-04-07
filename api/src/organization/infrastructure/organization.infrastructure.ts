import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../user/infrastructure/typeorm/user.entity';
import { MemberRepository } from '../domain/member.repository';
import { OrganizationRepository } from '../domain/organization.repository';
import { MemberEntity } from './typeorm/member.entity';
import { MemberRepositoryImpl } from './typeorm/member.repository-impl';
import { OrganizationEntity } from './typeorm/organization.entity';
import { OrganizationRepositoryImpl } from './typeorm/organization.repository-impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, OrganizationEntity, MemberEntity]),
  ],
  providers: [
    {
      provide: OrganizationRepository,
      useClass: OrganizationRepositoryImpl,
    },
    {
      provide: MemberRepository,
      useClass: MemberRepositoryImpl,
    },
  ],
  exports: [OrganizationRepository, MemberRepository],
})
export class OrganizationInfrastructure {}
