/** Response shape for signup and login (session + tokens). */
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullname: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  };
  member: {
    id: string;
    userId: string;
    organizationId: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
