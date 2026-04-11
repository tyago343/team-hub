import { HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
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
import {
  ExpiredRefreshTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  JwtTokenExpiredError,
  JwtTokenInvalidError,
} from '../../auth/domain/auth.errors';
import { DomainExceptionFilter } from './domain-exception.filter';

function createHostMock() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('DomainExceptionFilter', () => {
  const filter = new DomainExceptionFilter();

  it.each([
    [new UserNotFoundError('id'), HttpStatus.NOT_FOUND],
    [new OrganizationNotFoundError('id'), HttpStatus.NOT_FOUND],
    [new MemberNotFoundError('id'), HttpStatus.NOT_FOUND],
    [new UserAlreadyExistsError('e@e.com'), HttpStatus.CONFLICT],
    [new OrganizationSlugAlreadyExistsError('slug'), HttpStatus.CONFLICT],
    [new SlugAllocationError(), HttpStatus.CONFLICT],
    [new InvalidCredentialsError(), HttpStatus.UNAUTHORIZED],
    [new InvalidRefreshTokenError(), HttpStatus.UNAUTHORIZED],
    [new ExpiredRefreshTokenError(), HttpStatus.UNAUTHORIZED],
    [new JwtTokenInvalidError(), HttpStatus.UNAUTHORIZED],
    [new JwtTokenExpiredError(), HttpStatus.UNAUTHORIZED],
    [new InvalidEmailError('bad'), HttpStatus.BAD_REQUEST],
    [new InvalidSlugError('bad'), HttpStatus.BAD_REQUEST],
  ])('maps %s to status %i', (exception, expectedStatus) => {
    const { host, status, json } = createHostMock();
    filter.catch(exception as never, host);
    expect(status).toHaveBeenCalledWith(expectedStatus);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: expectedStatus,
        message: exception.message,
        error: exception.name,
      }),
    );
  });
});
