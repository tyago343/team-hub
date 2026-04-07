import { DynamicModule, Module, Type } from '@nestjs/common';
import { CreateOrganizationUseCase } from './commands/create-organization.use-case';
import { DeleteOrganizationUseCase } from './commands/delete-organization.use-case';
import { UpdateOrganizationUseCase } from './commands/update-organization.use-case';
import { GetAllOrganizationsUseCase } from './queries/get-all-organizations.use-case';
import { GetOrganizationByIdUseCase } from './queries/get-organization-by-id.use-case';
import { GetOrganizationBySlugUseCase } from './queries/get-organization-by-slug.use-case';

const useCases = [
  CreateOrganizationUseCase,
  DeleteOrganizationUseCase,
  UpdateOrganizationUseCase,
  GetAllOrganizationsUseCase,
  GetOrganizationByIdUseCase,
  GetOrganizationBySlugUseCase,
];

@Module({
  providers: [...useCases],
  exports: [...useCases],
})
export class OrganizationApplication {
  static withInfrastructure(
    infrastructureModule: Type | DynamicModule,
  ): DynamicModule {
    return {
      module: OrganizationApplication,
      imports: [infrastructureModule],
      providers: [...useCases],
      exports: [...useCases],
    };
  }
}
