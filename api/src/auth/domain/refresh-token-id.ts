import { Brand } from '../../shared/types/Brand';

export type RefreshTokenId = Brand<string, 'RefreshTokenId'>;

export function generateRefreshTokenId(): RefreshTokenId {
  return crypto.randomUUID() as RefreshTokenId;
}
