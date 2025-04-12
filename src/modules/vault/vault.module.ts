import { Module } from '@nestjs/common';
import { VaultController } from './controllers/vault.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { VaultActivity } from '@app/modules/vault/entities/vault-activity.entity';
import { VaultTransaction } from '@app/modules/vault/entities/vault-transaction.entity';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { VaultActivityService } from '@app/modules/vault/services/vault-activity.service';
import { VaultAction } from '@app/modules/vault/entities/vault-action.entity';
import { VaultDepositor } from '@app/modules/vault/entities/vault-depositor.entity';
import { VaultDepositorController } from '@app/modules/vault/controllers/vault-depositor.controller';
import { VaultActionService } from '@app/modules/vault/services/vault-action.service';
import { VaultDepositorService } from '@app/modules/vault/services/vault-depositor.service';
import { VaultTransactionService } from '@app/modules/vault/services/vault-transaction.service';
import { VenusService } from '@app/modules/vault/services/protocols/venus.service';
import { ProtocolFactoryService } from '@app/modules/vault/services/protocols/protocol.factory.service';
import { UserModule } from '@app/modules/user/user.module';
import { ChainModule } from '@app/modules/chain/chain.module';
import { TokenModule } from '@app/modules/token/token.module';
import { VaultContractService } from '@app/modules/vault/services/contracts/vault-contract.service';
import { ProtocolModule } from '@app/modules/protocol/protocol.module';
import { VaultProtocolService } from '@app/modules/vault/services/vault-protocol.service';
import { VaultProtocol } from '@app/modules/vault/entities/vault-protocol.entity';
import { VaultEvmService } from '@app/modules/vault/services/contracts/vault-evm.service';
import { VaultSolService } from '@app/modules/vault/services/contracts/vault-sol.service';
import { VaultBaseService } from './services/contracts/vault-base.service';

@Module({
    imports: [
        UserModule,
        ChainModule,
        TokenModule,
        TypeOrmModule.forFeature([Vault, VaultTransaction, VaultActivity, VaultAction, VaultDepositor, VaultProtocol]),
        TokenModule,
        ProtocolModule,
    ],
    controllers: [VaultDepositorController, VaultController],
    providers: [
        VaultService,
        VaultActivityService,
        VaultActionService,
        VaultDepositorService,
        VaultTransactionService,
        ProtocolFactoryService,
        VaultTransactionService,
        VaultContractService,
        VaultEvmService,
        VaultSolService,
        VaultProtocolService,
        VenusService,
        ProtocolFactoryService,
        VaultBaseService,
    ],
    exports: [
        VaultService,
        VaultActivityService,
        VaultActionService,
        VaultDepositorService,
        VaultTransactionService,
        VaultEvmService,
        VaultSolService,
        VaultProtocolService,
        VaultContractService,
        VenusService,
        ProtocolFactoryService,
        VaultBaseService,
    ],
})
export class VaultModule {}
