import { verifyPassword } from './auth.service';

describe('verifyPassword', () => {
  it('accepts a matching plain-text password', () => {
    expect(verifyPassword('secret123', 'secret123')).toBe(true);
  });

  it('rejects a mismatched password', () => {
    expect(verifyPassword('secret123', 'wrong-pass')).toBe(false);
  });
});
