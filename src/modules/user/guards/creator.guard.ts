import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { USER_ROLE } from '@app/modules/user/user.constants';
import { IUserVaultPayload } from '@app/modules/user/user.type';

@Injectable()
export class CreatorGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user: IUserVaultPayload = request.user;
        if (user.role != USER_ROLE.CREATOR) {
            return false;
        }
        return true;
    }
}
