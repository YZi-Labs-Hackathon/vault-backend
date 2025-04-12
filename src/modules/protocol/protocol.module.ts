import { Module } from '@nestjs/common';
import { ProtocolController } from './controllers/protocol.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from '@app/modules/protocol/entities/action.entity';
import { Protocol } from '@app/modules/protocol/entities/protocol.entity';
import { ProtocolAction } from '@app/modules/protocol/entities/protocol-action.entity';
import { ActionService } from '@app/modules/protocol/services/action.service';
import { ProtocolActionService } from '@app/modules/protocol/services/protocol-action.service';
import { ProtocolService } from '@app/modules/protocol/services/protocol.service';
import { ActionController } from '@app/modules/protocol/controllers/action.controller';
import { ProtocolToken } from '@app/modules/protocol/entities/protocol-token.entity';
import { ProtocolTokenService } from '@app/modules/protocol/services/protocol-token.service';

@Module({
    imports: [TypeOrmModule.forFeature([Action, Protocol, ProtocolAction, ProtocolToken])],
    controllers: [ProtocolController, ActionController],
    providers: [ActionService, ProtocolActionService, ProtocolService, ProtocolTokenService],
    exports: [ActionService, ProtocolService, ProtocolActionService, ProtocolTokenService],
})
export class ProtocolModule {}
