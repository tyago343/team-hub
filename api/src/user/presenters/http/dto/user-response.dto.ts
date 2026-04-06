import type { UserPrimitives } from '../../../domain/User';

export interface UserResponseDto {
  id: string;
  email: string;
  fullname: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toUserResponse(primitives: UserPrimitives): UserResponseDto {
  return {
    id: primitives.id,
    email: primitives.email,
    fullname: primitives.fullname,
    emailVerifiedAt: primitives.emailVerifiedAt,
    createdAt: primitives.createdAt,
    updatedAt: primitives.updatedAt,
  };
}
