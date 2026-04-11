import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import type { UserId } from '../../../user/domain/user-id';
import { DomainExceptionFilter } from '../../../shared/filters/domain-exception.filter';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation.pipe';
import { LoginUseCase } from '../../application/commands/login.use-case';
import { LogoutUseCase } from '../../application/commands/logout.use-case';
import { RefreshTokenUseCase } from '../../application/commands/refresh-token.use-case';
import { SignupUseCase } from '../../application/commands/signup.use-case';
import type { TokenPayload } from '../../domain/token-payload';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { type LoginDto, loginSchema } from './dto/login.dto';
import { type LogoutDto, logoutSchema } from './dto/logout.dto';
import { type RefreshDto, refreshSchema } from './dto/refresh.dto';
import { type SignupDto, signupSchema } from './dto/signup.dto';

@Controller('auth')
@UseFilters(DomainExceptionFilter)
export class AuthController {
  constructor(
    private readonly signup: SignupUseCase,
    private readonly login: LoginUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly logout: LogoutUseCase,
  ) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signupHandler(
    @Body(new ZodValidationPipe(signupSchema)) dto: SignupDto,
  ) {
    return this.signup.execute({
      fullname: dto.fullname,
      email: dto.email,
      password: dto.password,
      organizationName: dto.organizationName,
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginHandler(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    return this.login.execute({
      email: dto.email,
      password: dto.password,
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshHandler(
    @Body(new ZodValidationPipe(refreshSchema)) dto: RefreshDto,
  ) {
    return this.refreshToken.execute({ refreshToken: dto.refreshToken });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutHandler(
    @CurrentUser() user: TokenPayload,
    @Body(new ZodValidationPipe(logoutSchema)) dto: LogoutDto,
  ) {
    await this.logout.execute({
      userId: user.sub as UserId,
      refreshToken: dto.refreshToken,
    });
  }
}
