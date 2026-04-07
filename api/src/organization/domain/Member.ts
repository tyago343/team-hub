import type { OrganizationId } from './organization-id';
import { type MemberId, generateMemberId } from './member-id';
import type { Role } from './role';
import type { UserId } from '../../user/domain/user-id';

export interface MemberPrimitives {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class Member {
  private readonly _id: MemberId;
  private readonly _userId: UserId;
  private readonly _organizationId: OrganizationId;
  private _role: Role;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: MemberId;
    userId: UserId;
    organizationId: OrganizationId;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._userId = props.userId;
    this._organizationId = props.organizationId;
    this._role = props.role;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: {
    userId: UserId;
    organizationId: OrganizationId;
    role: Role;
  }): Member {
    const now = new Date();
    return new Member({
      id: generateMemberId(),
      userId: props.userId,
      organizationId: props.organizationId,
      role: props.role,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromPrimitives(props: MemberPrimitives): Member {
    return new Member({
      id: props.id as MemberId,
      userId: props.userId as UserId,
      organizationId: props.organizationId as OrganizationId,
      role: props.role,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  public toPrimitives(): MemberPrimitives {
    return {
      id: this._id,
      userId: this._userId,
      organizationId: this._organizationId,
      role: this._role,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id(): MemberId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get organizationId(): OrganizationId {
    return this._organizationId;
  }

  get role(): Role {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public changeRole(newRole: Role): void {
    this._role = newRole;
    this._updatedAt = new Date();
  }
}
