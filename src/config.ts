import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  adminUser: process.env.ADMIN_USER || 'admin',
  adminPass: process.env.ADMIN_PASS || 'admin',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  providers: [
    {
      id: 'local',
      name: 'Local MinIO',
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || '',
      secretKey: process.env.MINIO_SECRET_KEY || '',
      region: process.env.MINIO_REGION || 'us-east-1'
    },
    {
      id: 'aws',
      name: 'AWS S3',
      endPoint: process.env.AWS_S3_ENDPOINT || 's3.amazonaws.com',
      port: parseInt(process.env.AWS_S3_PORT || '443'),
      useSSL: process.env.AWS_S3_USE_SSL !== 'false',
      accessKey: process.env.AWS_ACCESS_KEY_ID || '',
      secretKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1'
    }
  ].filter(p => p.accessKey && p.secretKey)
};