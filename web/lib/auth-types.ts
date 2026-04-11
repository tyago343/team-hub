/** API response from POST /auth/signup and POST /auth/login */
export type AuthSessionResponse = {
  accessToken: string;
  refreshToken: string;
  user: unknown;
  organization: unknown;
  member: unknown;
};
