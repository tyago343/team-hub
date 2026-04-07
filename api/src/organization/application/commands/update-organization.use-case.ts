import { Injectable } from '@nestjs/common';
import { type OrganizationPrimitives } from '../../domain/Organization';
import {
  OrganizationNotFoundError,
  OrganizationSlugAlreadyExistsError,
} from '../../domain/organization.errors';
import type { OrganizationId } from '../../domain/organization-id';
import { OrganizationRepository } from '../../domain/organization.repository';
import { Slug } from '../../domain/slug.vo';

interface UpdateOrganizationCommand {
  id: string;
  name?: string;
  slug?: string;
}

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    command: UpdateOrganizationCommand,
  ): Promise<OrganizationPrimitives> {
    const org = await this.organizationRepository.findById(
      command.id as OrganizationId,
    );
    if (!org) {
      throw new OrganizationNotFoundError(command.id);
    }

    if (command.name !== undefined) {
      org.rename(command.name);
    }

    if (command.slug !== undefined) {
      const newSlug = Slug.create(command.slug.trim().toLowerCase());
      if (!newSlug.equals(org.slug)) {
        const existing = await this.organizationRepository.findBySlug(newSlug);
        if (existing && existing.id !== org.id) {
          throw new OrganizationSlugAlreadyExistsError(newSlug.value);
        }
        org.changeSlug(newSlug);
      }
    }

    await this.organizationRepository.update(org);

    return org.toPrimitives();
  }
}
