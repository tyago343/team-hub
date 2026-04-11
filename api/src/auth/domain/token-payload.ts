import type { Role } from 'src/organization/domain/role';

export interface TokenPayload {
  sub: string;
  email: string;
  organizationId: string;
  memberId: string;
  role: Role;
}
