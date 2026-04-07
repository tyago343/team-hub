import type { OrganizationPrimitives } from '../../../domain/Organization';

export interface OrganizationResponseDto {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toOrganizationResponse(
  primitives: OrganizationPrimitives,
): OrganizationResponseDto {
  return {
    id: primitives.id,
    name: primitives.name,
    slug: primitives.slug,
    createdAt: primitives.createdAt,
    updatedAt: primitives.updatedAt,
  };
}
