import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { UserEntity } from '../../../user/infrastructure/typeorm/user.entity';
import { Role, type Role as MemberRole } from '../../domain/role';

const ROLE_ENUM = Object.values(Role);

@Entity('members')
@Unique(['userId', 'organizationId'])
export class MemberEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { nullable: false })
  userId: string;

  @Column('uuid', { nullable: false })
  organizationId: string;

  @Column({ type: 'varchar', length: 32, nullable: false, enum: ROLE_ENUM })
  role: MemberRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization?: OrganizationEntity;
}
