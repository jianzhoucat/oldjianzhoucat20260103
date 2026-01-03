import crypto from 'crypto';

export type PasswordRecord = {
  salt: string;
  hash: string;
};

export function hashPassword(password: string): PasswordRecord {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(inputPassword: string, record: PasswordRecord) {
  const inputHash = crypto.scryptSync(inputPassword, record.salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(record.hash, 'hex'));
}

