import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { OpaqueTokenHasher } from '../domain/opaque-token-hasher.port';

@Injectable()
export class Sha256OpaqueTokenHasher extends OpaqueTokenHasher {
  hash(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
