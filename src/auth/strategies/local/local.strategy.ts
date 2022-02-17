import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../../../users/entities/user.entity';
import { AuthService } from '../../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email'
        });
    }

    /**
     * Validate User with Email and Password
     * @param email of the user
     * @param password of the user
     * @returns a user if he is valid, if not throw an Unauthorized Exception
     */
    async validate(email: string, password: string): Promise<User> {
        // Validate user and check if user still exists
        const user = await this.authService.validateUserWithEmailPassword(
            email,
            password
        );
        return user;
    }
}
