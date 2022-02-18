// Testing these is not necessary
/* istanbul ignore file */

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export class FakeAuthGuardFactory {
    private user;
    //private isActive: boolean = true;
    private reflector: Reflector;
    setUser(user) {
        this.user = user;
    }

    // setActive(bool: boolean) {
    //     this.isActive = bool;
    // }
    setReflector(reflector: Reflector) {
        this.reflector = reflector;
    }
    getGuard() {
        return {
            canActivate: (context: ExecutionContext) => {
                context.switchToHttp().getRequest().user = this.user;
                const isPublic = this.reflector.get<boolean>(
                    'isPublic',
                    context.getHandler()
                );
                return isPublic;
            }
        };
    }
}
