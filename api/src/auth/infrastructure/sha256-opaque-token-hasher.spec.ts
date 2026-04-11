import { createHash } from 'node:crypto';
import { Sha256OpaqueTokenHasher } from './sha256-opaque-token-hasher';

describe('Sha256OpaqueTokenHasher', () => {
  it('returns deterministic SHA-256 hex of the raw token', () => {
    const hasher = new Sha256OpaqueTokenHasher();
    const raw = 'opaque-refresh-token';
    const expected = createHash('sha256').update(raw).digest('hex');

    expect(hasher.hash(raw)).toBe(expected);
    expect(hasher.hash(raw)).toBe(expected);
  });

  it('produces different hashes for different inputs', () => {
    const hasher = new Sha256OpaqueTokenHasher();
    expect(hasher.hash('a')).not.toBe(hasher.hash('b'));
  });
});
