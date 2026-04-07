import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { MemberNotFoundError } from 'src/organization/domain/member.errors';
import {
  InvalidSlugError,
  OrganizationNotFoundError,
  OrganizationSlugAlreadyExistsError,
} from 'src/organization/domain/organization.errors';
import {
  InvalidEmailError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from 'src/user/domain/user.errors';

type DomainException =
  | UserNotFoundError
  | UserAlreadyExistsError
  | InvalidEmailError
  | OrganizationNotFoundError
  | OrganizationSlugAlreadyExistsError
  | InvalidSlugError
  | MemberNotFoundError;

@Catch(
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidEmailError,
  OrganizationNotFoundError,
  OrganizationSlugAlreadyExistsError,
  InvalidSlugError,
  MemberNotFoundError,
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
      exception instanceof OrganizationSlugAlreadyExistsError
    ) {
      return HttpStatus.CONFLICT;
    }
    return HttpStatus.BAD_REQUEST;
  }
}
