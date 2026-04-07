import { Injectable } from '@nestjs/common';
import { OrganizationNotFoundError } from '../../domain/organization.errors';
import type { OrganizationId } from '../../domain/organization-id';
import { OrganizationRepository } from '../../domain/organization.repository';

interface DeleteOrganizationCommand {
  id: string;
}

@Injectable()
export class DeleteOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(command: DeleteOrganizationCommand): Promise<void> {
    const org = await this.organizationRepository.findById(
      command.id as OrganizationId,
    );
    if (!org) {
      throw new OrganizationNotFoundError(command.id);
    }

    await this.organizationRepository.delete(command.id as OrganizationId);
  }
}
