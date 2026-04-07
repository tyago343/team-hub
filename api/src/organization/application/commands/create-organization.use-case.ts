import { Injectable } from '@nestjs/common';
import {
  type OrganizationPrimitives,
  Organization,
} from '../../domain/Organization';
import { OrganizationSlugAlreadyExistsError } from '../../domain/organization.errors';
import { OrganizationRepository } from '../../domain/organization.repository';
import { Slug } from '../../domain/slug.vo';

interface CreateOrganizationCommand {
  name: string;
  slug?: string;
}

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    command: CreateOrganizationCommand,
  ): Promise<OrganizationPrimitives> {
    const slug = command.slug
      ? Slug.create(command.slug.trim().toLowerCase())
      : Slug.fromOrganizationName(command.name);

    const existing = await this.organizationRepository.findBySlug(slug);
    if (existing) {
      throw new OrganizationSlugAlreadyExistsError(slug.value);
    }

    const organization = Organization.create({
      name: command.name,
      slug,
    });

    await this.organizationRepository.save(organization);

    return organization.toPrimitives();
  }
}
