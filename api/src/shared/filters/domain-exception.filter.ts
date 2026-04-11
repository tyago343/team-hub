import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ExpiredRefreshTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  JwtTokenExpiredError,
  JwtTokenInvalidError,
} from '../../auth/domain/auth.errors';
import { MemberNotFoundError } from '../../organization/domain/member.errors';
import {
  InvalidSlugError,
  OrganizationNotFoundError,
  OrganizationSlugAlreadyExistsError,
  SlugAllocationError,
} from '../../organization/domain/organization.errors';
import {
  InvalidEmailError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../user/domain/user.errors';

type DomainException =
  | UserNotFoundError
  | UserAlreadyExistsError
  | InvalidEmailError
  | OrganizationNotFoundError
  | OrganizationSlugAlreadyExistsError
  | InvalidSlugError
  | SlugAllocationError
  | MemberNotFoundError
  | InvalidCredentialsError
  | InvalidRefreshTokenError
  | ExpiredRefreshTokenError
  | JwtTokenInvalidError
  | JwtTokenExpiredError;

@Catch(
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidEmailError,
  OrganizationNotFoundError,
  OrganizationSlugAlreadyExistsError,
  InvalidSlugError,
  SlugAllocationError,
  MemberNotFoundError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  ExpiredRefreshTokenError,
  JwtTokenInvalidError,
  JwtTokenExpiredError,
)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.resolveStatus(exception);

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }

  private resolveStatus(exception: DomainException): number {
    if (
      exception instanceof UserNotFoundError ||
      exception instanceof OrganizationNotFoundError ||
      exception instanceof MemberNotFoundError
    ) {
      return HttpStatus.NOT_FOUND;
    }
    if (
      exception instanceof UserAlreadyExistsError ||
      exception instanceof OrganizationSlugAlreadyExistsError ||
      exception instanceof SlugAllocationError
    ) {
      return HttpStatus.CONFLICT;
    }
    if (
      exception instanceof InvalidCredentialsError ||
      exception instanceof InvalidRefreshTokenError ||
      exception instanceof ExpiredRefreshTokenError ||
      exception instanceof JwtTokenInvalidError ||
      exception instanceof JwtTokenExpiredError
    ) {
      return HttpStatus.UNAUTHORIZED;
    }
    return HttpStatus.BAD_REQUEST;
  }
}
