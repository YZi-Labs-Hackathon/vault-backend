import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CipherService } from '@app/modules/shared/services/cipher.service';
import { RequestService } from '@app/modules/shared/services/request.service';

@Global()
@Module({
    imports: [HttpModule],
    controllers: [],
    providers: [CipherService, RequestService],
    exports: [CipherService, RequestService],
})
export class SharedModule {}
