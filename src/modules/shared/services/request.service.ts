import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'hpagent';

export interface RequestInterface extends AxiosRequestConfig {
    query?: any;
}

@Injectable()
export class RequestService {
    constructor(private readonly httpService: HttpService) {}

    async request(request) {
        let configOption: any;
        const injectHeaders = {};
        const headers = request.headers || {};

        configOption = {
            url: request.url,
            method: request.method,
            validateStatus: () => true,
            headers: {
                ...injectHeaders,
                ...headers,
            },
            params: request.params,
            data: request.data,
            auth: request.auth,
        };

        if (request.timeout) {
            configOption.timeout = request.timeout;
        }

        if (request.proxy) {
            configOption.proxy = request.proxy;
        }

        if (request.query) {
            configOption.params = request.query;
        }
        const response = await this.httpService.axiosRef.request(configOption);
        if (!(response.status >= 200 && response.status < 300)) {
            throw new BadRequestException(
                response.data?.error ? response.data?.error : response.data?.err ?? response.statusText
            );
        }
        return response.data;
    }

    async requestProxy(request) {
        let configOption: any;
        const injectHeaders = {};
        const headers = request.headers || {};

        configOption = {
            url: request.url,
            method: request.method,
            validateStatus: () => true,
            httpsAgent: new HttpsProxyAgent({
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxSockets: 256,
                maxFreeSockets: 256,
                proxy: process.env.PROXY_URL,
            }),
            headers: {
                ...injectHeaders,
                ...headers,
            },
            params: request.params,
            data: request.data,
            auth: request.auth,
        };

        if (request.timeout) {
            configOption.timeout = request.timeout;
        }

        if (request.proxy) {
            configOption.proxy = request.proxy;
        }

        if (request.query) {
            configOption.params = request.query;
        }
        const response = await this.httpService.axiosRef.request(configOption);
        if (!(response.status >= 200 && response.status < 300)) {
            console.error(response);
            return null;
        }
        return response.data;
    }
}
