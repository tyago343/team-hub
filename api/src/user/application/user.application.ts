import { DynamicModule, Module, Type } from '@nestjs/common';
import { CreateUserUseCase } from './commands/create-user.use-case';
import { DeleteUserUseCase } from './commands/delete-user.use-case';
import { UpdateUserUseCase } from './commands/update-user.use-case';
import { GetAllUsersUseCase } from './queries/get-all-users.use-case';
import { GetUserByEmailUseCase } from './queries/get-user-by-email.use-case';
import { GetUserByIdUseCase } from './queries/get-user-by-id.use-case';

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  UpdateUserUseCase,
  GetAllUsersUseCase,
  GetUserByEmailUseCase,
  GetUserByIdUseCase,
];

@Module({
  providers: [...useCases],
  exports: [...useCases],
})
export class UserApplication {
  static withInfrastructure(
    infrastructureModule: Type | DynamicModule,
  ): DynamicModule {
    return {
      module: UserApplication,
      imports: [infrastructureModule],
      providers: [...useCases],
      exports: [...useCases],
    };
  }
}
