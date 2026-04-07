import { Organization, type OrganizationPrimitives } from './Organization';
import { Slug } from './slug.vo';

const VALID_PRIMITIVES: OrganizationPrimitives = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Acme',
  slug: 'acme',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
};

describe('Organization', () => {
  describe('create', () => {
    it('should generate id and timestamps', () => {
      const before = new Date();
      const org = Organization.create({
        name: '  My Org  ',
        slug: Slug.create('my-org'),
      });
      const after = new Date();

      expect(org.id).toBeDefined();
      expect(org.name).toBe('My Org');
      expect(org.slug.value).toBe('my-org');
      expect(org.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(org.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(org.updatedAt.getTime()).toBe(org.createdAt.getTime());
    });
  });

  describe('fromPrimitives / toPrimitives', () => {
    it('should roundtrip', () => {
      const org = Organization.fromPrimitives(VALID_PRIMITIVES);
      expect(org.toPrimitives()).toEqual(VALID_PRIMITIVES);
    });
  });

  describe('rename', () => {
    it('should update name and updatedAt', () => {
      const org = Organization.fromPrimitives(VALID_PRIMITIVES);
      const prev = org.updatedAt;

      org.rename('New Name');

      expect(org.name).toBe('New Name');
      expect(org.updatedAt.getTime()).toBeGreaterThanOrEqual(prev.getTime());
    });
  });

  describe('changeSlug', () => {
    it('should update slug and updatedAt', () => {
      const org = Organization.fromPrimitives(VALID_PRIMITIVES);
      const prev = org.updatedAt;
      const newSlug = Slug.create('new-slug');

      org.changeSlug(newSlug);

      expect(org.slug.equals(newSlug)).toBe(true);
      expect(org.updatedAt.getTime()).toBeGreaterThanOrEqual(prev.getTime());
    });
  });
});
