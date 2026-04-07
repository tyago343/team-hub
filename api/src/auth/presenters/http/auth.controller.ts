import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { DomainExceptionFilter } from '../../../shared/filters/domain-exception.filter';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation.pipe';
import { SignupUseCase } from '../../application/commands/signup.use-case';
import { type SignupDto, signupSchema } from './dto/signup.dto';

@Controller('auth')
@UseFilters(DomainExceptionFilter)
export class AuthController {
  constructor(private readonly signup: SignupUseCase) {}

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
}
