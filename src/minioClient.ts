import * as Minio from 'minio';
import { config } from './config';

export class MinioManager {
  private client: Minio.Client;

  constructor() {
    console.log(`🔌 Initializing MinIO Client:`);
    console.log(`   - Endpoint: ${config.minio.endPoint}`);
    console.log(`   - Port: ${config.minio.port}`);
    console.log(`   - SSL: ${config.minio.useSSL}`);
    console.log(`   - AccessKey: ${config.minio.accessKey ? '******' : 'MISSING'}`);

    this.client = new Minio.Client({
      endPoint: config.minio.endPoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
  }

  async listBucketsWithStatus() {
    try {
      const buckets = await this.client.listBuckets();
      console.log(`🔍 Found ${buckets.length} buckets in MinIO.`);
      
      const bucketInfos = await Promise.all(buckets.map(async (bucket) => {
        let isPublic = false;
        try {
            const policyStr = await this.client.getBucketPolicy(bucket.name);
            if (policyStr) {
                const policy = JSON.parse(policyStr);
                // Check simplistic "Read Only" public pattern
                const hasPublicRead = policy.Statement?.some((stmt: any) => 
                    stmt.Effect === 'Allow' && 
                    stmt.Principal?.AWS?.includes('*') &&
                    stmt.Action?.includes('s3:GetObject')
                );
                isPublic = !!hasPublicRead;
            }
        } catch (err) {
            // If error (e.g. NoSuchBucketPolicy), assume private
            isPublic = false;
        }

        return {
            name: bucket.name,
            creationDate: bucket.creationDate,
            isPublic
        };
      }));

      return bucketInfos;
    } catch (error) {
      console.error('Error listing buckets:', error);
      throw error;
    }
  }

  async createBucket(bucketName: string) {
    // Check if exists
    const exists = await this.client.bucketExists(bucketName);
    if (exists) {
      throw new Error(`Bucket ${bucketName} already exists.`);
    }
    await this.client.makeBucket(bucketName, 'us-east-1'); // Region is mandatory but often ignored by MinIO default
    return true;
  }

  async setBucketVisibility(bucketName: string, makePublic: boolean) {
    if (makePublic) {
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
    } else {
      // To make private, we simply remove the policy (or set empty)
      // MinIO client api has setBucketPolicy with empty string usually working to clear, 
      // or we can just send an empty statement policy. 
      // Safest for "Private" is usually clearing it.
      await this.client.setBucketPolicy(bucketName, "");
    }
  }

  async deleteBucket(bucketName: string) {
    // MinIO only allows deleting empty buckets via removeBucket
    await this.client.removeBucket(bucketName);
  }

  async listObjects(bucketName: string, prefix: string = ''): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const objects: any[] = [];
      // listObjectsV2 is better for folders (grouping by delimiter)
      const stream = this.client.listObjectsV2(bucketName, prefix, false, ''); 
      stream.on('data', (obj) => objects.push(obj));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(objects));
    });
  }

  async getPresignedUrl(bucketName: string, objectName: string): Promise<string> {
    // URL valid for 1 hour
    return await this.client.presignedGetObject(bucketName, objectName, 3600);
  }
}

export const minioManager = new MinioManager();
