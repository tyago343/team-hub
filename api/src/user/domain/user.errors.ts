export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email "${email}" already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class UserNotFoundError extends Error {
  constructor(identifier: string) {
    super(`User "${identifier}" not found`);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid email format: "${email}"`);
    this.name = 'InvalidEmailError';
  }
}
