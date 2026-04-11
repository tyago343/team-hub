export class OrganizationNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Organization "${identifier}" not found`);
    this.name = 'OrganizationNotFoundError';
  }
}

export class OrganizationSlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Organization with slug "${slug}" already exists`);
    this.name = 'OrganizationSlugAlreadyExistsError';
  }
}

export class InvalidSlugError extends Error {
  constructor(slug: string) {
    super(`Invalid slug format: "${slug}"`);
    this.name = 'InvalidSlugError';
  }
}

export class SlugAllocationError extends Error {
  constructor() {
    super('Could not allocate a unique organization slug');
    this.name = 'SlugAllocationError';
  }
}
