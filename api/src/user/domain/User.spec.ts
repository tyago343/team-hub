import User, { UserPrimitives } from './User';
import { HashedPassword } from './HashedPassword';

const VALID_PASSWORD = 'hashed_password_value' as HashedPassword;
const OTHER_PASSWORD = 'other_hashed_password' as HashedPassword;

const VALID_PRIMITIVES: UserPrimitives = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  password: 'hashed_password_value',
  fullname: 'John Doe',
  emailVerifiedAt: null,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
};

describe('User', () => {
  describe('create', () => {
    it('should generate an id and set timestamps', () => {
      const before = new Date();
      const user = User.create({
        email: 'new@example.com',
        password: VALID_PASSWORD,
        fullname: 'Jane Doe',
      });
      const after = new Date();

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.id.length).toBeGreaterThan(0);
      expect(user.email.value).toBe('new@example.com');
      expect(user.fullname).toBe('Jane Doe');
      expect(user.emailVerifiedAt).toBeNull();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(user.updatedAt.getTime()).toBe(user.createdAt.getTime());
    });

    it('should propagate Email validation error for invalid email', () => {
      expect(() =>
        User.create({
          email: 'not-an-email',
          password: VALID_PASSWORD,
          fullname: 'Jane Doe',
        }),
      ).toThrow('Invalid email format');
    });
  });

  describe('fromPrimitives', () => {
    it('should reconstitute all fields correctly', () => {
      const user = User.fromPrimitives(VALID_PRIMITIVES);

      expect(user.id).toBe(VALID_PRIMITIVES.id);
      expect(user.email.value).toBe(VALID_PRIMITIVES.email);
      expect(user.password).toBe(VALID_PRIMITIVES.password);
      expect(user.fullname).toBe(VALID_PRIMITIVES.fullname);
      expect(user.emailVerifiedAt).toBeNull();
      expect(user.createdAt).toEqual(VALID_PRIMITIVES.createdAt);
      expect(user.updatedAt).toEqual(VALID_PRIMITIVES.updatedAt);
    });
  });

  describe('toPrimitives', () => {
    it('should serialize to plain object', () => {
      const user = User.fromPrimitives(VALID_PRIMITIVES);
      const primitives = user.toPrimitives();

      expect(primitives).toEqual(VALID_PRIMITIVES);
    });

    it('should roundtrip create -> toPrimitives', () => {
      const user = User.create({
        email: 'roundtrip@example.com',
        password: VALID_PASSWORD,
        fullname: 'Round Trip',
      });
      const primitives = user.toPrimitives();

      expect(primitives.email).toBe('roundtrip@example.com');
      expect(primitives.fullname).toBe('Round Trip');
      expect(primitives.password).toBe(VALID_PASSWORD);
      expect(primitives.emailVerifiedAt).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    it('should set emailVerifiedAt and update updatedAt', () => {
      const user = User.fromPrimitives(VALID_PRIMITIVES);
      const originalUpdatedAt = user.updatedAt;

      user.verifyEmail();

      expect(user.emailVerifiedAt).toBeInstanceOf(Date);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('changePassword', () => {
    it('should replace password and update updatedAt', () => {
      const user = User.fromPrimitives(VALID_PRIMITIVES);
      const originalUpdatedAt = user.updatedAt;

      user.changePassword(OTHER_PASSWORD);

      expect(user.password).toBe(OTHER_PASSWORD);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });
});
