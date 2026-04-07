import { InvalidSlugError } from './organization.errors';

function slugifyName(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.length > 0 ? base : 'org';
}

export class Slug {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(raw: string): Slug {
    const normalized = raw.trim().toLowerCase();
    if (!Slug.isValidFormat(normalized)) {
      throw new InvalidSlugError(raw);
    }
    return new Slug(normalized);
  }

  public static fromOrganizationName(name: string): Slug {
    return Slug.create(slugifyName(name));
  }

  private static isValidFormat(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 1;
  }

  get value(): string {
    return this._value;
  }

  public equals(other: Slug): boolean {
    return this._value === other._value;
  }
}
