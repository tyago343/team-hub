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
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation.pipe';
import { DomainExceptionFilter } from '../../../shared/filters/domain-exception.filter';
import { CreateUserUseCase } from '../../application/commands/create-user.use-case';
import { DeleteUserUseCase } from '../../application/commands/delete-user.use-case';
import { UpdateUserUseCase } from '../../application/commands/update-user.use-case';
import { GetAllUsersUseCase } from '../../application/queries/get-all-users.use-case';
import { GetUserByIdUseCase } from '../../application/queries/get-user-by-id.use-case';
import { type CreateUserDto, createUserSchema } from './dto/create-user.dto';
import {
  type GetUsersQueryDto,
  getUsersQuerySchema,
} from './dto/get-users-query.dto';
import { type UpdateUserDto, updateUserSchema } from './dto/update-user.dto';
import { toUserResponse } from './dto/user-response.dto';

@Controller('users')
@UseFilters(DomainExceptionFilter)
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getAllUsers: GetAllUsersUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto,
  ) {
    const primitives = await this.createUser.execute(dto);
    return toUserResponse(primitives);
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(getUsersQuerySchema)) query: GetUsersQueryDto,
  ) {
    const result = await this.getAllUsers.execute(query);
    return {
      data: result.data.map(toUserResponse),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const primitives = await this.getUserById.execute({ id });
    if (!primitives) {
      throw new NotFoundException(`User "${id}" not found`);
    }
    return toUserResponse(primitives);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto,
  ) {
    const primitives = await this.updateUser.execute({ id, ...dto });
    return toUserResponse(primitives);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUser.execute({ id });
  }
}
