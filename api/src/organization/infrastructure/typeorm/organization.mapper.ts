import { Organization } from '../../domain/Organization';
import { OrganizationEntity } from './organization.entity';

export class OrganizationMapper {
  static toDomain(entity: OrganizationEntity): Organization {
    return Organization.fromPrimitives({
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toEntity(organization: Organization): OrganizationEntity {
    const p = organization.toPrimitives();
    const entity = new OrganizationEntity();
    entity.id = p.id;
    entity.name = p.name;
    entity.slug = p.slug;
    entity.createdAt = p.createdAt;
    entity.updatedAt = p.updatedAt;
    return entity;
  }
}
