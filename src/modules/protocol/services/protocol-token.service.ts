import { CommonService } from '@app/modules/shared/common/common.service';
import { Injectable } from '@nestjs/common';
import { ProtocolToken } from '@app/modules/protocol/entities/protocol-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { _CreateProtocolTokenDto } from '../dto';
import { STATUS } from '@app/modules/shared/shared.constants';
@Injectable()
export class ProtocolTokenService extends CommonService<ProtocolToken> {
    constructor(
        @InjectRepository(ProtocolToken)
        readonly repository: Repository<ProtocolToken>
    ) {
        super(repository);
    }

    async addProtocolTokens(protocolId: string, tokens: _CreateProtocolTokenDto[]) {
        const protocolTokens = tokens.map((token) => ({
            ...token,
            protocolId: protocolId,
            status: STATUS.ACTIVE,
        }));
        await this.creates(protocolTokens);
        return true;
    }

    async syncProtocolTokens(protocolId: string, tokens: _CreateProtocolTokenDto[]) {
        const protocolTokens = await this.findAll({ where: { protocolId } });

        const toCreate = tokens.filter((token) => !protocolTokens.some((pt) => pt.tokenId === token.tokenId));
        const toInActive = protocolTokens.filter((pt) => !tokens.some((token) => pt.tokenId === token.tokenId));

        await Promise.all(
            toCreate.map(async (token) => {
                await this.create({ ...token, protocolId, status: STATUS.ACTIVE });
            })
        );

        await Promise.all(
            toInActive.map(async (pt) => {
                await this.update(pt.id, { status: STATUS.INACTIVE });
            })
        );

        return true;
    }
}
