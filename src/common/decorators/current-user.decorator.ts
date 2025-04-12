import { GqlExecutionContext } from '@nestjs/graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserVaultData } from '@app/modules/auth/auth.types';

/**
 * Return the current user from the request
 */
export const CurrentUser = createParamDecorator<UserVaultData>((_: any, ctx: ExecutionContext): UserVaultData => {
    if (ctx.getType<'graphql'>() === 'graphql') {
        const context = GqlExecutionContext.create(ctx);
        return context.getContext().req.user;
    }
    const req = ctx.switchToHttp().getRequest();

    return req.user;
});
