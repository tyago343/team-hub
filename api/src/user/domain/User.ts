import { Email } from './Email';
import { HashedPassword } from './HashedPassword';
import { UserId, generateUserId } from './UserId';

export interface UserPrimitives {
  id: string;
  email: string;
  password: string;
  fullname: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default class User {
  private readonly _id: UserId;
  private readonly _email: Email;
  private _password: HashedPassword;
  private readonly _fullname: string;
  private _emailVerifiedAt: Date | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: UserId;
    email: Email;
    password: HashedPassword;
    fullname: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._email = props.email;
    this._password = props.password;
    this._fullname = props.fullname;
    this._emailVerifiedAt = props.emailVerifiedAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(props: {
    email: string;
    password: HashedPassword;
    fullname: string;
  }): User {
    const now = new Date();
    return new User({
      id: generateUserId(),
      email: Email.create(props.email),
      password: props.password,
      fullname: props.fullname,
      emailVerifiedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromPrimitives(props: UserPrimitives): User {
    return new User({
      id: props.id as UserId,
      email: Email.fromPrimitives(props.email),
      password: props.password as HashedPassword,
      fullname: props.fullname,
      emailVerifiedAt: props.emailVerifiedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  public toPrimitives(): UserPrimitives {
    return {
      id: this._id,
      email: this._email.value,
      password: this._password,
      fullname: this._fullname,
      emailVerifiedAt: this._emailVerifiedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get password(): HashedPassword {
    return this._password;
  }

  get fullname(): string {
    return this._fullname;
  }

  get emailVerifiedAt(): Date | null {
    return this._emailVerifiedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public verifyEmail(): void {
    this._emailVerifiedAt = new Date();
    this._updatedAt = new Date();
  }

  public changePassword(newPassword: HashedPassword): void {
    this._password = newPassword;
    this._updatedAt = new Date();
  }
}
