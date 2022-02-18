import {
    ExecutionContext,
    HttpStatus,
    UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {
    public constructor(private readonly reflector: Reflector) {
        super();
    }

    // Since we can't intersect before the strategy, the check for public paths is done after jwt token was checked
    handleRequest(err, user, info, context: ExecutionContext) {
        const req: any = context.switchToHttp().getRequest<Request>();
        const isPublic = this.reflector.get<boolean>(
            'isPublic',
            context.getHandler()
        );

        // If path is public, allow access
        if (isPublic) {
            return null;
        }

        // If user provided invalid token or was unauthorized by user validation, throw error
        if (req.authInfo || err?.status === HttpStatus.UNAUTHORIZED) {
            throw new UnauthorizedException(
                'Your are not allowed to use this service.'
            );
        }

        // Currently users are not used but for the future this will sit here
        req.user = user;
        return user;
    }
}
