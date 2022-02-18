import {
    Injectable,
    InternalServerErrorException,
    Logger,
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
    private CLIENT_id: ObjectId;
    private CLIENT_SECRET: string;
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Register User (Creates a new one)
     * @param credentials of the user
     * @returns the new registered User
     */
    async registerUser(credentials: RegisterDto): Promise<AccessTokenDto> {
        // While this might seem unnecessary now, this way of implementing this allows us to add logic to register later without affecting the user create itself
        const user: User = await this.userService.create(credentials);

        /* istanbul ignore next */
        if (!user) {
            this.logger.error(`User could not be created`);
            throw new InternalServerErrorException('User could not be created');
        }
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
        let user: User;
        try {
            user = await this.userService.findOneByEmail(email);
        } catch (error) {
            // This is necessary as a not found exception would overwrite the guard response
        }

        // Check if user exists
        if (!user) {
            this.logger.warn(
                `User tried to login in but user did not exist.  If this happens often, there might be a brute force attack`
            );
            throw new UnauthorizedException(
                `Login Failed due to invalid credentials`
            );
        }
        // Check if password is correct
        if (!(await bcrypt.compare(password, user.password))) {
            this.logger.warn(
                `User tried to login in password did not match. If this happens often, there might be a brute force attack`
            );
            throw new UnauthorizedException(
                `Login Failed due to invalid credentials`
            );
        }

        if (user.status === UserStatus.BANNED) {
            this.logger.debug(`A banned user tried to log in`);
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
            this.logger.warn(
                `User tried to login with JWT containing an invalid id. This might indicicate JWT manipulation`
            );
            // This is necessary as a not found exception would overwrite the guard response
            return false;
        }

        /* istanbul ignore next */
        if (!user) {
            this.logger.warn(
                `An unusual error occured while trying to validate JWT. This might indicicate JWT manipulation or internal server problems`
            );
            // This should never happen but just in case
            return false;
        }
        if (
            user.status !== UserStatus.ACTIVE &&
            user.status !== UserStatus.UNVERIFIED
        ) {
            this.logger.debug(
                `A user tried to login with a ${user.status} account`
            );
            return false;
        }

        this.logger.debug(`A user logged in successfuly`);
        return user;
    }
}
