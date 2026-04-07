import { InvalidSlugError } from './organization.errors';
import { Slug } from './slug.vo';

describe('Slug', () => {
  describe('create', () => {
    it('should create a valid slug', () => {
      const slug = Slug.create('acme-corp');
      expect(slug.value).toBe('acme-corp');
    });

    it('should normalize to lowercase', () => {
      const slug = Slug.create('Acme-Corp');
      expect(slug.value).toBe('acme-corp');
    });

    it('should trim whitespace', () => {
      const slug = Slug.create('  my-slug  ');
      expect(slug.value).toBe('my-slug');
    });

    it('should throw InvalidSlugError for empty after trim', () => {
      expect(() => Slug.create('   ')).toThrow(InvalidSlugError);
    });

    it('should throw InvalidSlugError for invalid characters', () => {
      expect(() => Slug.create('bad_slug')).toThrow(InvalidSlugError);
    });
  });

  describe('fromOrganizationName', () => {
    it('should slugify a simple name', () => {
      expect(Slug.fromOrganizationName('Acme Corp').value).toBe('acme-corp');
    });

    it('should strip accents', () => {
      expect(Slug.fromOrganizationName('Café Río').value).toBe('cafe-rio');
    });

    it('should collapse spaces and punctuation', () => {
      expect(Slug.fromOrganizationName('Foo   Bar!!!').value).toBe('foo-bar');
    });

    it('should use org when name yields empty slug', () => {
      expect(Slug.fromOrganizationName('!!!').value).toBe('org');
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const a = Slug.create('x');
      const b = Slug.create('x');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different values', () => {
      const a = Slug.create('a');
      const b = Slug.create('b');
      expect(a.equals(b)).toBe(false);
    });
  });
});
