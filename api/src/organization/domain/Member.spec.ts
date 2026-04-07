import { Member, type MemberPrimitives } from './Member';
import type { OrganizationId } from './organization-id';
import { Role } from './role';
import type { UserId } from '../../user/domain/user-id';

const VALID_PRIMITIVES: MemberPrimitives = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  userId: '550e8400-e29b-41d4-a716-446655440003',
  organizationId: '550e8400-e29b-41d4-a716-446655440004',
  role: Role.MEMBER,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
};

describe('Member', () => {
  describe('create', () => {
    it('should create with OWNER role', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440010' as UserId;
      const orgId = '550e8400-e29b-41d4-a716-446655440011' as OrganizationId;

      const member = Member.create({
        userId,
        organizationId: orgId,
        role: Role.OWNER,
      });

      expect(member.role).toBe(Role.OWNER);
      expect(member.userId).toBe(userId);
      expect(member.organizationId).toBe(orgId);
    });
  });

  describe('fromPrimitives / toPrimitives', () => {
    it('should roundtrip', () => {
      const member = Member.fromPrimitives(VALID_PRIMITIVES);
      expect(member.toPrimitives()).toEqual(VALID_PRIMITIVES);
    });
  });

  describe('changeRole', () => {
    it('should update role and updatedAt', () => {
      const member = Member.fromPrimitives(VALID_PRIMITIVES);
      const prev = member.updatedAt;

      member.changeRole(Role.ADMIN);

      expect(member.role).toBe(Role.ADMIN);
      expect(member.updatedAt.getTime()).toBeGreaterThanOrEqual(prev.getTime());
    });
  });
});
