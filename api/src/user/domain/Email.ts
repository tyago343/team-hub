export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!Email.isValidFormat(normalized)) {
      throw new Error('Invalid email format');
    }
    return new Email(normalized);
  }

  public static fromPrimitives(raw: string): Email {
    return new Email(raw);
  }

  private static isValidFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get value(): string {
    return this._value;
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }
}
