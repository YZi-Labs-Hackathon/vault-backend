import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ActionInterface } from '@app/modules/vault/services/protocols/action.interface';
import { VenusService } from './venus.service';

@Injectable()
export class ProtocolFactoryService implements OnModuleInit {
    protected actions: ActionInterface[] = [];
    @Inject(forwardRef(() => VenusService)) protected readonly venusService: VenusService;

    onModuleInit() {
        const map = new Map();
        map.set('venusService', this.venusService);
        this.actions.push(...map.values());
    }

    getProtocolService(protocolService: string): ActionInterface {
        return this.actions.find((action) => action.getIdentifier() === protocolService);
    }
}
