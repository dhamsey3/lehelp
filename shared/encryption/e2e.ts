/**
 * End-to-End Encryption utilities
 * Implements Signal Protocol-like encryption for client-to-client messaging
 */

import crypto from 'crypto';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  ciphertext: string;
  ephemeralPublicKey: string;
  iv: string;
  tag: string;
}

/**
 * Generate RSA key pair for asymmetric encryption
 */
export function generateKeyPair(): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return {
    publicKey,
    privateKey,
  };
}

/**
 * Generate ECDH key pair for key exchange
 */
export function generateECDHKeyPair(): KeyPair {
  const ecdh = crypto.createECDH('secp256k1');
  ecdh.generateKeys();

  return {
    publicKey: ecdh.getPublicKey('hex'),
    privateKey: ecdh.getPrivateKey('hex'),
  };
}

/**
 * Derive shared secret from ECDH key exchange
 */
export function deriveSharedSecret(
  privateKey: string,
  publicKey: string
): Buffer {
  const ecdh = crypto.createECDH('secp256k1');
  ecdh.setPrivateKey(Buffer.from(privateKey, 'hex'));
  
  return ecdh.computeSecret(Buffer.from(publicKey, 'hex'));
}

/**
 * Encrypt message using hybrid encryption (ECDH + AES)
 */
export function encryptMessage(
  message: string,
  recipientPublicKey: string
): EncryptedMessage {
  // Generate ephemeral key pair
  const ephemeralKeyPair = generateECDHKeyPair();
  
  // Derive shared secret
  const sharedSecret = deriveSharedSecret(
    ephemeralKeyPair.privateKey,
    recipientPublicKey
  );
  
  // Derive encryption key from shared secret
  const encryptionKey = crypto
    .createHash('sha256')
    .update(sharedSecret)
    .digest();

  // Generate IV
  const iv = crypto.randomBytes(16);
  
  // Encrypt message
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  let ciphertext = cipher.update(message, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  
  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    ephemeralPublicKey: ephemeralKeyPair.publicKey,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt message using hybrid encryption
 */
export function decryptMessage(
  encryptedMessage: EncryptedMessage,
  recipientPrivateKey: string
): string {
  // Derive shared secret
  const sharedSecret = deriveSharedSecret(
    recipientPrivateKey,
    encryptedMessage.ephemeralPublicKey
  );
  
  // Derive decryption key
  const decryptionKey = crypto
    .createHash('sha256')
    .update(sharedSecret)
    .digest();

  const iv = Buffer.from(encryptedMessage.iv, 'hex');
  const tag = Buffer.from(encryptedMessage.tag, 'hex');
  
  // Decrypt message
  const decipher = crypto.createDecipheriv('aes-256-gcm', decryptionKey, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encryptedMessage.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Sign data with private key
 */
export function sign(data: string, privateKey: string): string {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  
  return sign.sign(privateKey, 'hex');
}

/**
 * Verify signature with public key
 */
export function verify(
  data: string,
  signature: string,
  publicKey: string
): boolean {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  
  return verify.verify(publicKey, signature, 'hex');
}

/**
 * Encrypt using RSA public key (for small data like keys)
 */
export function rsaEncrypt(data: string, publicKey: string): string {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer
  );
  
  return encrypted.toString('base64');
}

/**
 * Decrypt using RSA private key
 */
export function rsaDecrypt(encryptedData: string, privateKey: string): string {
  const buffer = Buffer.from(encryptedData, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer
  );
  
  return decrypted.toString('utf8');
}
