import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { UserAuthService } from '../services/user.auth.service';
import { ChainType } from '@app/common/types';
import { ethers } from 'ethers';
import { PublicKey } from '@solana/web3.js';
import { decodeUTF8 } from 'tweetnacl-util';
import * as nacl from 'tweetnacl';

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(
        @Inject(UserAuthService)
        private readonly userAuthService: UserAuthService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let { challengeCode, address, signature } = request.body;

        if (!challengeCode || !address || !signature) {
            throw new BadRequestException('Missing authentication parameters');
        }

        // Validate challenge code
        const existChallengeCode = await this.userAuthService.getExistChallengeCode(address);
        if (challengeCode !== existChallengeCode) {
            throw new BadRequestException('Invalid challenge code');
        }

        let chainType: ChainType;
        if (ethers.isAddress(address)) {
            address = ethers.getAddress(address);
            chainType = ChainType.EVM;
        } else if (this.userAuthService.isSolanaAddress(address)) {
            chainType = ChainType.SOLANA;
        } else {
            throw new BadRequestException('Invalid address format');
        }

        let status = false;
        switch (chainType) {
            case ChainType.EVM:
                const recoveredAddress = ethers.verifyMessage(challengeCode, signature);
                status = recoveredAddress === address;
                break;
            case ChainType.SOLANA:
                const messageBytes = decodeUTF8(challengeCode);
                const pubkey = new PublicKey(address);
                const bufferSignature = Buffer.from(signature, 'hex');
                const rawMsg = new Uint8Array(
                    bufferSignature.buffer,
                    bufferSignature.byteOffset,
                    bufferSignature.byteLength
                );
                status = nacl.sign.detached.verify(messageBytes, rawMsg, pubkey.toBytes());
                break;
        }

        if (!status) {
            throw new UnauthorizedException('Login failed');
        }

        request.user = {
            address,
            chainType, // Store chainType for further processing in the controller
        };

        return true;
    }
}
