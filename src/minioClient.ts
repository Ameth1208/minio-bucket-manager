import * as Minio from 'minio';
import { config } from './config';

export class MinioManager {
  private clients: Map<string, Minio.Client> = new Map();
  private providerConfigs: Map<string, any> = new Map();

  constructor() {
    console.log(`🔌 Initializing Multi-Cloud Manager...`);
    config.providers.forEach(p => {
        console.log(`   - Adding Provider: ${p.name} (${p.id})`);
        const client = new Minio.Client({
            endPoint: p.endPoint,
            port: p.port,
            useSSL: p.useSSL,
            accessKey: p.accessKey,
            secretKey: p.secretKey,
            region: p.region
        });
        this.clients.set(p.id, client);
        this.providerConfigs.set(p.id, p);
    });
  }

  private getClient(providerId: string): Minio.Client {
    const client = this.clients.get(providerId);
    if (!client) throw new Error(`Provider ${providerId} not found`);
    return client;
  }

  async listBucketsWithStatus() {
    const allBuckets: any[] = [];
    
    for (const [id, client] of this.clients.entries()) {
        try {
            const buckets = await client.listBuckets();
            const providerName = this.providerConfigs.get(id).name;

            const bucketInfos = await Promise.all(buckets.map(async (bucket) => {
                let isPublic = false;
                try {
                    const policyStr = await client.getBucketPolicy(bucket.name);
                    if (policyStr) {
                        const policy = JSON.parse(policyStr);
                        isPublic = policy.Statement?.some((stmt: any) => 
                            stmt.Effect === 'Allow' && 
                            stmt.Principal?.AWS?.includes('*') &&
                            stmt.Action?.includes('s3:GetObject')
                        );
                    }
                } catch { isPublic = false; }

                return {
                    name: bucket.name,
                    creationDate: bucket.creationDate,
                    isPublic,
                    providerId: id,
                    providerName
                };
            }));
            allBuckets.push(...bucketInfos);
        } catch (err) {
            console.error(`Error listing buckets for ${id}:`, err);
        }
    }
    return allBuckets;
  }

  async getBucketStats(providerId: string, bucketName: string) {
    const client = this.getClient(providerId);
    return new Promise((resolve, reject) => {
        let size = 0;
        let count = 0;
        const stream = client.listObjectsV2(bucketName, '', true);
        stream.on('data', (obj) => {
            size += obj.size || 0;
            count++;
        });
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve({ size, count }));
    });
  }

  async createBucket(providerId: string, bucketName: string) {
    const client = this.getClient(providerId);
    const conf = this.providerConfigs.get(providerId);
    await client.makeBucket(bucketName, conf.region);
    return true;
  }

  async setBucketVisibility(providerId: string, bucketName: string, makePublic: boolean) {
    const client = this.getClient(providerId);
    if (makePublic) {
      const policy = {
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
        }]
      };
      await client.setBucketPolicy(bucketName, JSON.stringify(policy));
    } else {
      await client.setBucketPolicy(bucketName, "");
    }
  }

  async deleteBucket(providerId: string, bucketName: string) {
    await this.getClient(providerId).removeBucket(bucketName);
  }

  async listObjects(providerId: string, bucketName: string, prefix: string = ''): Promise<any[]> {
    const client = this.getClient(providerId);
    return new Promise((resolve, reject) => {
      const objects: any[] = [];
      const stream = client.listObjectsV2(bucketName, prefix, false, ''); 
      stream.on('data', (obj) => objects.push(obj));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(objects));
    });
  }

  async uploadFile(providerId: string, bucketName: string, objectName: string, filePath: string) {
    await this.getClient(providerId).fPutObject(bucketName, objectName, filePath);
    return true;
  }

  async deleteObjects(providerId: string, bucketName: string, objectNames: string[]) {
    await this.getClient(providerId).removeObjects(bucketName, objectNames);
  }

  async searchObjects(query: string) {
    const results: any[] = [];
    for (const [id, client] of this.clients.entries()) {
        const buckets = await client.listBuckets();
        await Promise.all(buckets.map(async (bucket) => {
            return new Promise<void>((resolve) => {
                const stream = client.listObjectsV2(bucket.name, '', true);
                stream.on('data', (obj) => {
                    if (obj.name && obj.name.toLowerCase().includes(query.toLowerCase())) {
                        results.push({ ...obj, bucket: bucket.name, providerId: id });
                    }
                });
                stream.on('error', () => resolve());
                stream.on('end', () => resolve());
            });
        }));
    }
    return results;
  }

  async getPresignedUrl(providerId: string, bucketName: string, objectName: string, expiry: number = 3600): Promise<string> {
    return await this.getClient(providerId).presignedGetObject(bucketName, objectName, expiry);
  }

  async getObjectStream(providerId: string, bucketName: string, objectName: string) {
    return await this.getClient(providerId).getObject(bucketName, objectName);
  }
}

export const minioManager = new MinioManager();
