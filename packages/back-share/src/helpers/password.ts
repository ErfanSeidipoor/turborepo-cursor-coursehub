import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);

export const generateHashPassword = async (
  password: string,
): Promise<string> => {
  const salt = randomBytes(8).toString('hex');
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  return salt + '.' + hash.toString('hex');
};

export const verifyPassword = async (
  hashedPassword: string,
  password: string,
): Promise<boolean> => {
  if (!hashedPassword) return false;

  const [salt, storedHash] = hashedPassword.split('.');

  const hash = (await scrypt(password, salt, 32)) as Buffer;

  if (hash.toString('hex') !== storedHash) {
    return false;
  }

  return true;
};
