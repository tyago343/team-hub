import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { DomainExceptionFilter } from '../../../shared/filters/domain-exception.filter';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation.pipe';
import { CreateOrganizationUseCase } from '../../application/commands/create-organization.use-case';
import { DeleteOrganizationUseCase } from '../../application/commands/delete-organization.use-case';
import { UpdateOrganizationUseCase } from '../../application/commands/update-organization.use-case';
import { GetAllOrganizationsUseCase } from '../../application/queries/get-all-organizations.use-case';
import { GetOrganizationByIdUseCase } from '../../application/queries/get-organization-by-id.use-case';
import { GetOrganizationBySlugUseCase } from '../../application/queries/get-organization-by-slug.use-case';
import {
  type CreateOrganizationDto,
  createOrganizationSchema,
} from './dto/create-organization.dto';
import {
  type GetOrganizationsQueryDto,
  getOrganizationsQuerySchema,
} from './dto/get-organizations-query.dto';
import {
  type UpdateOrganizationDto,
  updateOrganizationSchema,
} from './dto/update-organization.dto';
import { toOrganizationResponse } from './dto/organization-response.dto';

@Controller('organizations')
@UseFilters(DomainExceptionFilter)
export class OrganizationController {
  constructor(
    private readonly createOrganization: CreateOrganizationUseCase,
    private readonly getAllOrganizations: GetAllOrganizationsUseCase,
    private readonly getOrganizationById: GetOrganizationByIdUseCase,
    private readonly getOrganizationBySlug: GetOrganizationBySlugUseCase,
    private readonly updateOrganization: UpdateOrganizationUseCase,
    private readonly deleteOrganization: DeleteOrganizationUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createOrganizationSchema))
    dto: CreateOrganizationDto,
  ) {
    const primitives = await this.createOrganization.execute(dto);
    return toOrganizationResponse(primitives);
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(getOrganizationsQuerySchema))
    query: GetOrganizationsQueryDto,
  ) {
    const result = await this.getAllOrganizations.execute(query);
    return {
      data: result.data.map(toOrganizationResponse),
      meta: result.meta,
    };
  }

  @Get('by-slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const primitives = await this.getOrganizationBySlug.execute({ slug });
    if (!primitives) {
      throw new NotFoundException(`Organization with slug "${slug}" not found`);
    }
    return toOrganizationResponse(primitives);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const primitives = await this.getOrganizationById.execute({ id });
    if (!primitives) {
      throw new NotFoundException(`Organization "${id}" not found`);
    }
    return toOrganizationResponse(primitives);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateOrganizationSchema))
    dto: UpdateOrganizationDto,
  ) {
    const primitives = await this.updateOrganization.execute({ id, ...dto });
    return toOrganizationResponse(primitives);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteOrganization.execute({ id });
  }
}
