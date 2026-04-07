import { Brand } from '../../shared/types/Brand';

export type OrganizationId = Brand<string, 'OrganizationId'>;

export function generateOrganizationId(): OrganizationId {
  return crypto.randomUUID() as OrganizationId;
}
