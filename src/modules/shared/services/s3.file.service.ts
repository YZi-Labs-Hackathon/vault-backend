import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3FileService {
    private readonly AWS_S3_REGION = process.env.AWS_S3_REGION;
    private readonly AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
    private readonly AWS_S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID;
    private readonly AWS_S3_SECRET_KEY_ACCESS = process.env.AWS_S3_SECRET_KEY_ACCESS;

    async uploadPublicFile(
        dataBuffer: Buffer,
        extension: string,
        folder: string,
        fileName?: string,
        contentType?: string
    ) {
        const s3Client = new S3Client({
            region: this.AWS_S3_REGION,
            endpoint: `https://sgp1.digitaloceanspaces.com`,
            credentials: {
                accessKeyId: this.AWS_S3_ACCESS_KEY_ID,
                secretAccessKey: this.AWS_S3_SECRET_KEY_ACCESS,
            },
        });
        fileName = fileName || `${uuid()}.${extension}`;
        const key = `${folder}/${fileName}`;
        const command = new PutObjectCommand({
            Bucket: this.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: dataBuffer,
            ACL: 'public-read',
            CacheControl: 'max-age=31536000',
            ContentType: contentType || 'application/octet-stream' || 'image/jpg',
        });
        try {
            const response = await s3Client.send(command);
            console.log('File uploaded successfully:', response);
            const publicUrl = `https://cdn.mirailabs.co/${key}`;
            return publicUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
}
