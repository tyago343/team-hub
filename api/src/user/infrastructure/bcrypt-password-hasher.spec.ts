import { BcryptPasswordHasher } from './bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('hash produces a value that compare accepts for the same password', async () => {
    const plain = 'my-secret-password';
    const hashed = await hasher.hash(plain);

    expect(hashed).not.toBe(plain);
    expect(await hasher.compare(plain, hashed)).toBe(true);
  });

  it('compare returns false for wrong password', async () => {
    const hashed = await hasher.hash('correct');
    expect(await hasher.compare('wrong', hashed)).toBe(false);
  });
});
