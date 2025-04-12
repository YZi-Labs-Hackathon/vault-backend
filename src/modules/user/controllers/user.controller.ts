import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JWTGuard } from '@app/modules/auth/guards/jwt.guard';
import { CurrentUser } from '@app/common/decorators';
import { UserVaultData } from '@app/modules/auth/auth.types';
import { ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { VaultTVLAndPnlData } from '@app/modules/vault/vault.types';
import { IUserVaultPayload } from '@app/modules/user/user.type';
import { UserService } from '@app/modules/user/services/user.service';

@Controller('user')
@ApiTags('User')
@UseGuards(JWTGuard)
@ApiBearerAuth('accessBearer')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('/profile')
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    async profile(@CurrentUser() user: UserVaultData) {
        return this.userService.userInfo(user);
    }

    @Get('pnl')
    @ApiOperation({
        description: 'Get pnl user',
        summary: 'Get pnl user',
    })
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    @ApiResponseDecorator(VaultTVLAndPnlData, { status: 200, description: 'Get pnl user' })
    async getUserPnl(@CurrentUser() user: IUserVaultPayload) {
        return await this.userService.getUserPnl(user);
    }
}
