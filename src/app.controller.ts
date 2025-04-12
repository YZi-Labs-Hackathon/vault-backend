import { Controller, Get, Req, VERSION_NEUTRAL } from '@nestjs/common';
import moment from 'moment';
import { HealthCheckResult } from '@nestjs/terminus';
import { ApiExcludeController } from '@nestjs/swagger';
import { AppService } from '@app/app.service';

@Controller({
    version: VERSION_NEUTRAL,
})
@ApiExcludeController()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    async index(@Req() req): Promise<any> {
        return { uptime: moment().unix() };
    }

    @Get('health')
    async getServerHealth(): Promise<HealthCheckResult> {
        return this.appService.getServerHealth();
    }
}
