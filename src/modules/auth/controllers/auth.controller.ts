import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    ChallengeCodeResponse,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
} from '../dto/auth.dto';
import { ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { UserAuthService } from '../services/user.auth.service';
import { LoginGuard } from '@app/modules/auth/guards/login.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        @Inject(UserAuthService)
        private readonly userAuthService: UserAuthService
    ) {}

    @ApiOperation({ summary: 'Login to the application', description: 'Login to Partnr Vault using signature' })
    @ApiResponseDecorator(LoginResponse, { status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseGuards(LoginGuard)
    @Post('/login')
    async login(@Body() body: LoginRequest, @Req() req) {
        return this.userAuthService.login(req.user.address, req.user.chainType);
    }

    @ApiOperation({ summary: 'Refresh token', description: 'Refresh token' })
    @ApiResponseDecorator(RefreshTokenResponse, { status: 200, description: 'Refresh token successful' })
    @Post('/refresh')
    async refreshToken(@Body() body: RefreshTokenRequest) {
        return this.userAuthService.refreshToken(body.refreshToken);
    }

    @ApiOperation({ summary: 'Get challenge', description: 'Get challenge for login' })
    @ApiResponseDecorator(ChallengeCodeResponse, { status: 200, description: 'Challenge successful' })
    @Get('/challengeCode/:address')
    async challengeCode(@Param('address') address: string) {
        return this.userAuthService.generateChallengeCode(address);
    }
}
