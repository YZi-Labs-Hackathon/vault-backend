import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { VaultProtocol } from '@app/modules/vault/entities/vault-protocol.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VaultProtocolService extends CommonService<VaultProtocol> {
    constructor(@InjectRepository(VaultProtocol) readonly repository: Repository<VaultProtocol>) {
        super(repository);
    }
}
