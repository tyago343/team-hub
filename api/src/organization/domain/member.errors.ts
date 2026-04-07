export class MemberNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Member "${identifier}" not found`);
    this.name = 'MemberNotFoundError';
  }
}
