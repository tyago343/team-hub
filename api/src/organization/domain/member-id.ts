import { Brand } from '../../shared/types/Brand';

export type MemberId = Brand<string, 'MemberId'>;

export function generateMemberId(): MemberId {
  return crypto.randomUUID() as MemberId;
}
