import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// Initialize S3 client (works with MinIO and AWS S3)
const s3Config: any = {
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
};

// Add custom endpoint for MinIO (local development)
if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
  s3Config.forcePathStyle = true; // Required for MinIO
}

export const s3Client = new S3Client(s3Config);

const BUCKET_NAME = process.env.S3_BUCKET || 'lehelp-documents';

export interface UploadOptions {
  key: string;
  body: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageService {
  uploadFile: (options: UploadOptions) => Promise<string>;
  getSignedDownloadUrl: (key: string, expiresIn?: number) => Promise<string>;
  deleteFile: (key: string) => Promise<void>;
}

export const storageService: StorageService = {
  /**
   * Upload file to S3/MinIO
   */
  async uploadFile(options: UploadOptions): Promise<string> {
    const { key, body, contentType = 'application/octet-stream', metadata = {} } = options;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
      ServerSideEncryption: 'AES256', // Server-side encryption
    });

    try {
      await s3Client.send(command);
      logger.info(`File uploaded successfully: ${key}`);
      return key;
    } catch (error) {
      logger.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to storage');
    }
  },

  /**
   * Generate signed URL for secure download
   */
  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw new Error('Failed to generate download URL');
    }
  },

  /**
   * Delete file from S3/MinIO
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      await s3Client.send(command);
      logger.info(`File deleted successfully: ${key}`);
    } catch (error) {
      logger.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from storage');
    }
  },
};
