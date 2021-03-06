import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcyrpt from 'bcrypt';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {}

    // Allows for changing the hashing algo without breaking tests and other linked functionality
    async hashPassword(plaintext: string) {
        return await bcyrpt.hash(plaintext, 12);
    }

    /**
     * Create new user with credentials
     * @param credentials of the user
     * @returns User
     */
    async create(credentials: CreateUserDto): Promise<User> {
        try {
            const hash = await this.hashPassword(credentials.password);
            const user = new this.userModel({
                ...credentials,
                password: hash
            });

            // This order of operations is important
            // The user is saved first, then the verification code is generated
            // If the verification code generation fails, it can be rerequested later

            const result = await user.save();

            this.logger.debug(
                `A user has been sucessfully created: ${result._id}`
            );
            return result;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.username) {
                this.logger.warn(
                    `Creating a user (username = ${credentials.username}) failed due to a conflict.`
                );
                throw new ConflictException('Username is already taken.');
            } else if (error.code === 11000 && error.keyPattern.email) {
                this.logger.warn(
                    `Creating a user (email = ${credentials.email}) failed due to a conflict.`
                );
                throw new ConflictException('Email is already taken.');
            }
            /* istanbul ignore next */
            this.logger.error(
                `An error occured while creating a new user. (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException('User Create failed');
        }
    }

    /**
     * Find all user
     * @returns Array aus allen User
     */
    async findAll(): Promise<User[]> {
        return await this.userModel.find().lean();
    }

    /**
     * Find user by id
     * @param id of the user
     * @returns User
     */
    async findOneById(id: ObjectId): Promise<User> {
        const user = await this.userModel.findById(id).lean();

        if (!user) {
            this.logger.debug(
                `A user (id = ${id}) was requested but could not be found.`
            );
            throw new NotFoundException();
        }

        return user;
    }

    /**
     * Find user by email
     * @param email of the user
     * @returns User
     */
    async findOneByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email }).lean();

        if (!user) {
            this.logger.debug(
                `A user (email = ${email}) was requested but could not be found.`
            );
            throw new NotFoundException();
        }
        return user;
    }

    /**
     * Update the user
     * @param id ObjectId
     * @param updateUserDto Dto for updatesparseJWTtOUsable
     * @returns updated user (with changed fields)
     */
    async updateUser(
        id: ObjectId,
        updateUserDto: UpdateUserDto
    ): Promise<User> {
        if (updateUserDto.password) {
            updateUserDto.password = await this.hashPassword(
                updateUserDto.password
            );
        }
        let updatedUser: User;
        try {
            updatedUser = await this.userModel
                .findByIdAndUpdate(id, updateUserDto, {
                    new: true
                })
                .lean();
        } catch (error) {
            if (error.code === 11000 && error.keyPattern.username) {
                this.logger.warn(
                    `Updating a user (username = ${updateUserDto.username}) failed due to a conflict.`
                );
                throw new ConflictException('Username is already taken.');
            } else if (error.code === 11000 && error.keyPattern.email) {
                this.logger.warn(
                    `Updating a user (email = ${updateUserDto.email}) failed due to a conflict.`
                );
                throw new ConflictException('Email is already taken.');
            }
            // This should not occur under normal conditions
            else {
                /* istanbul ignore next */
                this.logger.error(
                    `An error occured while creating a new user. (${error})`
                );
                /* istanbul ignore next */
                throw new InternalServerErrorException('Update User failed');
            }
        }
        // Seperate exception to ensure that user gets a specific error but should never happen
        if (!updatedUser) {
            this.logger.warn(
                `Updating a user (id = ${id}) was requested but the user could not be found`
            );
            throw new NotFoundException('User not found');
        }

        this.logger.debug(`Updating a user (id = ${id}) was successful.`);
        return updatedUser;
    }

    async remove(id: ObjectId): Promise<User> {
        const user = await this.userModel.findByIdAndDelete(id);

        if (!user) {
            this.logger.warn(
                `Deletion a user (id = ${id}) was requested but the user could not be found`
            );
            throw new NotFoundException();
        }

        this.logger.debug(`User (id = ${id}) has been sucessfully deleted.`);
        return user;
    }
}
