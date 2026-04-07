import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaginationOptions } from '../../../shared/types/pagination';
import { Organization } from '../../domain/Organization';
import type { OrganizationId } from '../../domain/organization-id';
import { OrganizationRepository } from '../../domain/organization.repository';
import { Slug } from '../../domain/slug.vo';
import { OrganizationEntity } from './organization.entity';
import { OrganizationMapper } from './organization.mapper';

@Injectable()
export class OrganizationRepositoryImpl extends OrganizationRepository {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly ormRepository: Repository<OrganizationEntity>,
  ) {
    super();
  }

  async save(organization: Organization): Promise<Organization> {
    const entity = OrganizationMapper.toEntity(organization);
    await this.ormRepository.save(entity);
    return organization;
  }

  async findById(id: OrganizationId): Promise<Organization | null> {
    const row = await this.ormRepository.findOne({ where: { id } });
    return row ? OrganizationMapper.toDomain(row) : null;
  }

  async findBySlug(slug: Slug): Promise<Organization | null> {
    const row = await this.ormRepository.findOne({
      where: { slug: slug.value },
    });
    return row ? OrganizationMapper.toDomain(row) : null;
  }

  async findAll(
    options: PaginationOptions,
  ): Promise<{ data: Organization[]; total: number }> {
    const skip = (options.page - 1) * options.limit;
    const [entities, total] = await this.ormRepository.findAndCount({
      skip,
      take: options.limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data: entities.map((e) => OrganizationMapper.toDomain(e)),
      total,
    };
  }

  async delete(id: OrganizationId): Promise<void> {
    await this.ormRepository.delete({ id });
  }

  async update(organization: Organization): Promise<Organization> {
    const entity = OrganizationMapper.toEntity(organization);
    await this.ormRepository.save(entity);
    return organization;
  }
}
