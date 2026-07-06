import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export class PasswordHasher {
  hash(password) {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(String(password), salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  verify(password, storedHash) {
    const [salt, hash] = String(storedHash ?? '').split(':');
    if (!salt || !hash) return false;

    const derived = scryptSync(String(password), salt, 64);
    const expected = Buffer.from(hash, 'hex');

    return expected.length === derived.length && timingSafeEqual(expected, derived);
  }
}
