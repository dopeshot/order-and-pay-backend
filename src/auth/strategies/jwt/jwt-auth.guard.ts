import {
    ExecutionContext,
    HttpStatus,
    Logger,
    UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger('JwtAuthGuard');
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
            this.logger.debug('A public path was called');
            return null;
        }

        // If user provided invalid token or was unauthorized by user validation, throw error
        if (req.authInfo || err?.status === HttpStatus.UNAUTHORIZED) {
            this.logger.warn(
                `User login failed. The user with id ${user.userId} tried to log in but was unauthorized`
            );
            throw new UnauthorizedException(
                'Your are not allowed to use this service.'
            );
        }

        // Currently users are not used but for the future this will sit here
        req.user = user;

        this.logger.debug('A user authorized successfully');
        return user;
    }
}
