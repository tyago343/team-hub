import { Email } from './email.vo';
import { InvalidEmailError } from './user.errors';

describe('Email', () => {
  describe('create', () => {
    it('should create an Email from a valid address', () => {
      const email = Email.create('user@example.com');
      expect(email.value).toBe('user@example.com');
    });

    it('should normalize to lowercase', () => {
      const email = Email.create('User@Example.COM');
      expect(email.value).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  user@example.com  ');
      expect(email.value).toBe('user@example.com');
    });

    it('should throw InvalidEmailError on invalid format (missing @)', () => {
      expect(() => Email.create('invalid-email')).toThrow(InvalidEmailError);
    });

    it('should throw InvalidEmailError on invalid format (missing domain)', () => {
      expect(() => Email.create('user@')).toThrow(InvalidEmailError);
    });

    it('should throw InvalidEmailError on invalid format (missing local part)', () => {
      expect(() => Email.create('@example.com')).toThrow(InvalidEmailError);
    });

    it('should throw InvalidEmailError on empty string', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailError);
    });
  });

  describe('fromPrimitives', () => {
    it('should wrap without validation', () => {
      const email = Email.fromPrimitives('already-stored@example.com');
      expect(email.value).toBe('already-stored@example.com');
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const a = Email.create('user@example.com');
      const b = Email.create('user@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should return true for case-different inputs (normalized)', () => {
      const a = Email.create('User@Example.com');
      const b = Email.create('user@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different values', () => {
      const a = Email.create('alice@example.com');
      const b = Email.create('bob@example.com');
      expect(a.equals(b)).toBe(false);
    });
  });
});
