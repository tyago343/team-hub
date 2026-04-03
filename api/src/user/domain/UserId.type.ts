import { Brand } from '../../shared/types/Brand';

export type UserId = Brand<string, 'UserId'>;

export function generateUserId(): UserId {
  return crypto.randomUUID() as UserId;
}
