import type { UserId } from '../../user/domain/user-id';
import {
  type RefreshTokenId,
  generateRefreshTokenId,
} from './refresh-token-id';

export interface RefreshTokenPrimitives {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export class RefreshToken {
  private readonly _id: RefreshTokenId;
  private readonly _userId: UserId;
  private readonly _tokenHash: string;
  private readonly _expiresAt: Date;
  private _revokedAt: Date | null;
  private readonly _createdAt: Date;

  private constructor(props: {
    id: RefreshTokenId;
    userId: UserId;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }) {
    this._id = props.id;
    this._userId = props.userId;
    this._tokenHash = props.tokenHash;
    this._expiresAt = props.expiresAt;
    this._revokedAt = props.revokedAt;
    this._createdAt = props.createdAt;
  }

  public static create(props: {
    userId: UserId;
    tokenHash: string;
    expiresAt: Date;
  }): RefreshToken {
    const now = new Date();
    return new RefreshToken({
      id: generateRefreshTokenId(),
      userId: props.userId,
      tokenHash: props.tokenHash,
      expiresAt: props.expiresAt,
      revokedAt: null,
      createdAt: now,
    });
  }

  public static fromPrimitives(props: RefreshTokenPrimitives): RefreshToken {
    return new RefreshToken({
      id: props.id as RefreshTokenId,
      userId: props.userId as UserId,
      tokenHash: props.tokenHash,
      expiresAt: props.expiresAt,
      revokedAt: props.revokedAt,
      createdAt: props.createdAt,
    });
  }

  public toPrimitives(): RefreshTokenPrimitives {
    return {
      id: this._id,
      userId: this._userId,
      tokenHash: this._tokenHash,
      expiresAt: this._expiresAt,
      revokedAt: this._revokedAt,
      createdAt: this._createdAt,
    };
  }

  get id(): RefreshTokenId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get tokenHash(): string {
    return this._tokenHash;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get revokedAt(): Date | null {
    return this._revokedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  public revoke(): void {
    this._revokedAt = new Date();
  }

  public isActive(now: Date = new Date()): boolean {
    if (this._revokedAt !== null) {
      return false;
    }
    return now < this._expiresAt;
  }
}
