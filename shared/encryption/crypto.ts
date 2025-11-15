import crypto from 'crypto';

/**
 * Encryption utility for securing sensitive data
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt?: string;
}

/**
 * Derive encryption key from password using PBKDF2
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    'sha512'
  );
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(data: string, key: string | Buffer): EncryptedData {
  const iv = crypto.randomBytes(IV_LENGTH);
  const encryptionKey = typeof key === 'string' ? Buffer.from(key, 'hex') : key;

  if (encryptionKey.length !== KEY_LENGTH) {
    throw new Error(`Invalid key length. Expected ${KEY_LENGTH} bytes`);
  }

  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(encryptedData: EncryptedData, key: string | Buffer): string {
  const encryptionKey = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const tag = Buffer.from(encryptedData.tag, 'hex');

  if (encryptionKey.length !== KEY_LENGTH) {
    throw new Error(`Invalid key length. Expected ${KEY_LENGTH} bytes`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt data with password (includes key derivation)
 */
export function encryptWithPassword(data: string, password: string): EncryptedData {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  
  const encrypted = encrypt(data, key);
  
  return {
    ...encrypted,
    salt: salt.toString('hex'),
  };
}

/**
 * Decrypt data with password
 */
export function decryptWithPassword(
  encryptedData: EncryptedData,
  password: string
): string {
  if (!encryptedData.salt) {
    throw new Error('Salt is required for password-based decryption');
  }

  const salt = Buffer.from(encryptedData.salt, 'hex');
  const key = deriveKey(password, salt);

  return decrypt(encryptedData, key);
}

/**
 * Generate random encryption key
 */
export function generateKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Hash data using SHA-256
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt file stream (for large files)
 */
export function createEncryptStream(key: Buffer | string) {
  const encryptionKey = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  
  return {
    cipher,
    iv: iv.toString('hex'),
  };
}

/**
 * Decrypt file stream
 */
export function createDecryptStream(key: Buffer | string, iv: string) {
  const encryptionKey = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
  const ivBuffer = Buffer.from(iv, 'hex');
  
  return crypto.createDecipheriv(ALGORITHM, encryptionKey, ivBuffer);
}
