export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidRefreshTokenError extends Error {
  constructor(message = 'Invalid refresh token') {
    super(message);
    this.name = 'InvalidRefreshTokenError';
  }
}

export class ExpiredRefreshTokenError extends Error {
  constructor() {
    super('Refresh token has expired');
    this.name = 'ExpiredRefreshTokenError';
  }
}

export class JwtTokenInvalidError extends Error {
  constructor(message = 'Invalid token') {
    super(message);
    this.name = 'JwtTokenInvalidError';
  }
}

export class JwtTokenExpiredError extends Error {
  constructor() {
    super('Token has expired');
    this.name = 'JwtTokenExpiredError';
  }
}
