import { type OrganizationId, generateOrganizationId } from './organization-id';
import { Slug } from './slug.vo';

export interface OrganizationPrimitives {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Organization {
  private readonly _id: OrganizationId;
  private _name: string;
  private _slug: Slug;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: OrganizationId;
    name: string;
    slug: Slug;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._name = props.name;
    this._slug = props.slug;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: { name: string; slug: Slug }): Organization {
    const now = new Date();
    return new Organization({
      id: generateOrganizationId(),
      name: props.name.trim(),
      slug: props.slug,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromPrimitives(props: OrganizationPrimitives): Organization {
    return new Organization({
      id: props.id as OrganizationId,
      name: props.name,
      slug: Slug.create(props.slug),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  public toPrimitives(): OrganizationPrimitives {
    return {
      id: this._id,
      name: this._name,
      slug: this._slug.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id(): OrganizationId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get slug(): Slug {
    return this._slug;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public rename(newName: string): void {
    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  public changeSlug(newSlug: Slug): void {
    this._slug = newSlug;
    this._updatedAt = new Date();
  }
}
