import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/enums/status.enum';
import { UsersService } from '../users/users.service';
import { AccessTokenDto } from './dto/jwt.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    private CLIENT_ID: string;
    private CLIENT_SECRET: string;

    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService
    ) {
        this.CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID;
        this.CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET;
    }

    /**
     * Register User (Creates a new one)
     * @param credentials of the user
     * @returns the new registered User
     */
    async registerUser(credentials: RegisterDto): Promise<AccessTokenDto> {
        // While this might seem unnecessary now, this way of implementing this allows us to add logic to register later without affecting the user create itself
        const user: User = await this.userService.create(credentials);

        /* istanbul ignore next */
        if (!user)
            throw new InternalServerErrorException('User could not be created');

        // Generate and return JWT
        return await this.createLoginPayload(user);
    }

    /**
     * Search for a user by username and validate with the password
     * @param username of the user
     * @param password of the user
     * @returns user without password or if user do not exist returns null
     */
    async validateUserWithEmailPassword(
        email: string,
        password: string
    ): Promise<User> {
        let user: User = null;
        try {
            user = await this.userService.findOneByEmail(email);
        } catch (error) {
            // This is necessary as a not found exception would overwrite the guard response
        }

        // Check if user exists
        if (!user) {
            throw new UnauthorizedException(
                `Login Failed due to invalid credentials`
            );
        }
        // Check if password is correct
        if (!(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException(
                `Login Failed due to invalid credentials`
            );
        }

        if (user.status === UserStatus.BANNED) {
            throw new UnauthorizedException(
                `This user is banned. Please contact the administrator`
            );
        }

        return user;
    }

    /**
     * Creates Login Payload and generate JWT with the payload
     * @param user logged in user
     * @returns access token
     */
    createLoginPayload(user: User): AccessTokenDto {
        const payload = {
            username: user.username,
            sub: user._id
        };

        return {
            access_token: this.jwtService.sign(payload)
        };
    }

    async isValidJWT(userId: ObjectId): Promise<User | false> {
        let user: User;
        try {
            user = await this.userService.findOneById(userId);
        } catch (error) {
            // This is necessary as a not found exception would overwrite the guard response
            return false;
        }

        /* istanbul ignore next */
        if (!user) return false; // This should never happen but just in case

        if (
            user.status !== UserStatus.ACTIVE &&
            user.status !== UserStatus.UNVERIFIED
        ) {
            // TODO: Add status check once we decided on how to handle reported user
            return false;
        }

        return user;
    }
}
