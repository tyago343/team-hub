import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  InvalidEmailError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../user/domain/user.errors';

@Catch(UserNotFoundError, UserAlreadyExistsError, InvalidEmailError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception: UserNotFoundError | UserAlreadyExistsError | InvalidEmailError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof UserNotFoundError
        ? HttpStatus.NOT_FOUND
        : exception instanceof UserAlreadyExistsError
          ? HttpStatus.CONFLICT
          : HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }
}
