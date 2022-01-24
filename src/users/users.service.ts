import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    ServiceUnavailableException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcyrpt from 'bcrypt';
import { Model, ObjectId } from 'mongoose';
import { JwtUserDto } from 'src/auth/dto/jwt.dto';
import { MailVerifyDto } from 'src/mail/dto/mail-verify.dto';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UserStatus } from './enums/status.enum';
import { userDataFromProvider } from './interfaces/userDataFromProvider.interface';
import { returnUser } from './types/returnUser.type';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private userSchema: Model<UserDocument>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ) {}

    /**
     * Create new user with credentials
     * @param credentials of the user
     * @returns User
     */
    async create(credentials: CreateUserDto): Promise<User> {
        try {
            const hash = await this.hashPassword(credentials.password);
            const user = new this.userSchema({
                ...credentials,
                status: UserStatus.UNVERIFIED,
                password: hash
            });

            const result = await user.save();

            await this.createVerification(result);

            return result;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.username)
                throw new ConflictException('Username is already taken.');
            else if (error.code === 11000 && error.keyPattern.email)
                throw new ConflictException('Email is already taken.');
            else if (error instanceof ServiceUnavailableException) throw error;
            /* istanbul ignore next */
            throw new InternalServerErrorException('User Create failed');
        }
    }

    async hashPassword(password: string): Promise<string> {
        return bcyrpt.hash(password, 12);
    }

    async parseJWTtOUsable(JWTuser): Promise<UserDocument> {
        const user = await this.userSchema.findById(JWTuser._id);

        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async generateVerifyCode(user: User): Promise<string> {
        const payload = {
            mail: user.email,
            name: user.username,
            id: user._id,
            create_time: Date.now()
        };

        return this.jwtService.sign(payload, {
            secret: process.env.VERIFY_JWT_SECRET,
            expiresIn: process.env.VERIFY_JWT_EXPIRESIN
        });
    }

    async createVerification(user: User): Promise<string> {
        const verifyCode = await this.generateVerifyCode(user);

        await this.mailService.sendMail<MailVerifyDto>(
            user.email,
            'MailVerify',
            {
                name: user.username,
                link: `${process.env.HOST}/api/user/verify-account/?code=${verifyCode}`
            },
            'Verify your email'
        );

        return verifyCode;
    }

    async createUserFromProvider(
        userDataFromProvider: userDataFromProvider
    ): Promise<User> {
        try {
            const user: UserDocument = new this.userSchema(
                userDataFromProvider
            );
            const result = await user.save();

            return result;
        } catch (error) {
            throw new InternalServerErrorException(
                'Error occured while saving user from provider.'
            );
        }
    }

    /**
     * Find all user
     * @returns Array aus allen User
     */
    async findAll(): Promise<User[]> {
        return await this.userSchema.find();
    }

    /**
     * Find user by id
     * @param id of the user
     * @returns User
     */
    async findOneById(id: ObjectId): Promise<User> {
        const user = await this.userSchema.findById(id).lean();

        if (!user) throw new NotFoundException();

        return user;
    }

    /**
     * Find user by username
     * @param username of the user
     * @returns User
     */
    async findOneByUsername(username: string): Promise<User> {
        const user = await this.userSchema.findOne({ username }).lean();

        if (!user) throw new NotFoundException();

        return user;
    }

    /**
     * Find user by email
     * @param email of the user
     * @returns User
     */
    async findOneByEmail(email: string): Promise<User | null> {
        const user = await this.userSchema.findOne({ email }).lean();

        if (!user) return null;

        return user;
    }

    /**
     * FOR TESTING update role - do not use in deployment (or disable endpoint)
     * @param id object id
     * @param role
     * @returns User
     */
    async patchRole(id: ObjectId, role: any): Promise<User> {
        try {
            const updatedUser: User = await this.userSchema.findByIdAndUpdate(
                id,
                {
                    role: role.role
                },
                {
                    new: true
                }
            );

            return updatedUser;
        } catch (error) {
            throw new InternalServerErrorException('Update Role failed');
        }
    }

    async updateUser(
        id: ObjectId,
        updateUserDto: UpdateUserDto,
        actingUser: JwtUserDto
    ): Promise<User> {
        // User should only be able to update his own data (Admin can update all)
        if (
            id.toString() !== actingUser._id.toString() &&
            actingUser.role !== Role.ADMIN
        ) {
            throw new ForbiddenException();
        }

        try {
            const updatedUser: User = await this.userSchema.findByIdAndUpdate(
                id,
                {
                    ...updateUserDto
                },
                {
                    new: true
                }
            );

            return updatedUser;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.username)
                throw new ConflictException('Username is already taken.');
            else if (error.code === 11000 && error.keyPattern.email)
                throw new ConflictException('Email is already taken.');
            else throw new InternalServerErrorException('Update User failed');
        }
    }

    async remove(id: ObjectId, actingUser: JwtUserDto): Promise<User> {
        // User should only be able to delete own account (Admin can delete all)
        if (
            id.toString() !== actingUser._id.toString() &&
            actingUser.role !== Role.ADMIN
        ) {
            throw new ForbiddenException();
        }

        const user = await this.userSchema.findByIdAndDelete(id);

        if (!user) throw new NotFoundException();

        return user;
    }

    async validateVerifyCode(userId: ObjectId): Promise<boolean> {
        let user: User;
        try {
            user = await this.findOneById(userId);
        } catch (error) {
            // This is necessary as a not found exception would overwrite the guard response
            return false;
        }
        if (!user) return false; // This should never happen but just in case
        if (user.status !== UserStatus.UNVERIFIED) {
            return false;
        }
        return true;
    }
    /**
     * Verify a user and set the status of said user to active.
     * @param code - email validation code
     * @returns the updated user object
     */

    async veryfiyUser(userId: ObjectId): Promise<UserDocument> {
        const user = await this.userSchema.findByIdAndUpdate(userId, {
            status: UserStatus.ACTIVE
        });

        if (!user) {
            throw new NotFoundException();
        }
        return user;
    }

    async transformToReturn(user: User): Promise<returnUser> {
        const strip = {
            _id: user._id,
            username: user.username,
            email: user.email,
            status: user.status,
            role: user.role,
            provider: user.provider
        };
        return strip;
    }
}
