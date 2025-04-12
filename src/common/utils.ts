import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';
import crypto from 'crypto';
import { CHAIN_TYPE, PROTOCOL } from '@app/modules/shared/shared.constants';

export function toEpochSeconds(date: Date | number): number {
    if (date instanceof Date) {
        return Math.floor(date.getTime() / 1000);
    }
    return Math.floor(date / 1000);
}

export const getExpiration = (ttl: number) => {
    const expiration = new Date();
    expiration.setUTCSeconds(expiration.getUTCSeconds() + ttl);
    return expiration;
};

const fileFilter = (req: any, file, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/svg+xml' ||
        file.mimetype === 'image/svg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/webp'
    ) {
        callback(null, true);
    } else {
        // rejects storing a file
        callback(new BadRequestException('Extension file not allow'), false);
    }
};

export const multerOptions: MulterOptions = {
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5, files: 1 },
};

export const decrypt = (encryptedText: string, enc: string, iv: string, algorithm: string = 'aes-256-cbc'): string => {
    const decipher = crypto.createDecipheriv(algorithm, enc, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

export const encrypt = (text: string, secret: string, iv: string, algorithm: string = 'aes-256-cbc'): string => {
    const cipher = crypto.createCipheriv(algorithm, secret, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

export const _formatString = (str) => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    return str;
};

export const getChainTypeByProtocol = (protocol: PROTOCOL) => {
    switch (protocol) {
        case PROTOCOL.ETHEREUM:
            return CHAIN_TYPE.EIP155;
        case PROTOCOL.TON:
            return CHAIN_TYPE.TON;
        case PROTOCOL.SOLANA:
            return CHAIN_TYPE.SOLANA;
        default:
            return CHAIN_TYPE.EIP155;
    }
};

export interface ChartDataPoint {
    time: number;
    value: number;
}
