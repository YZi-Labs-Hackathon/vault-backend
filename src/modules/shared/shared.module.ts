import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CipherService } from '@app/modules/shared/services/cipher.service';
import { RequestService } from '@app/modules/shared/services/request.service';
import { S3FileService } from '@app/modules/shared/services/s3.file.service';
import { FileController } from '@app/modules/shared/controllers/file.controller';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';

@Global()
@Module({
    imports: [HttpModule],
    controllers: [FileController],
    providers: [
        CipherService,
        RequestService,
        S3FileService,
        VaultValidatorService,
    ],
    exports: [CipherService, RequestService, S3FileService, VaultValidatorService ],
})
export class SharedModule {}
