/* istanbul ignore file */

import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';

// Used to disable endpoints in production
@Injectable()
export class ENVGuard implements CanActivate {
    private readonly logger = new Logger(ENVGuard.name);
    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        if (process.env.RUNTIME_ENV !== 'prod') {
            this.logger.warn(
                `A request has been blocked, due to production mode being activated. (path: ${
                    context.switchToHttp().getRequest<Request>().url
                }, method: ${
                    context.switchToHttp().getRequest<Request>().method
                })`
            );
            return true;
        }
        this.logger.debug(
            `Protected route has been called but production mode is not activated.(path: ${
                context.switchToHttp().getRequest<Request>().url
            }, method: ${context.switchToHttp().getRequest<Request>().method})`
        );
        return false;
    }
}
