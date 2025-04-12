import { Injectable } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class AppService {
    constructor(private healthCheckService: HealthCheckService, private http: HttpHealthIndicator) {}

    getServerHealth() {
        return this.healthCheckService.check([
            () => this.http.pingCheck('Server runtime', `http://localhost:${process.env.PORT}`),
        ]);
    }
}
