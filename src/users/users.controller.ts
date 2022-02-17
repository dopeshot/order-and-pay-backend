import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Request,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Get all Users' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'All users have been returned',
        type: User,
        isArray: true
    })
    async getAllUsers(): Promise<User[]> {
        return plainToClass(User, await this.usersService.findAll());
    }

    @Get('/profile')
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returned user profile',
        type: User
    })
    async getProfile(@Request() req): Promise<User> {
        return plainToClass(
            User,
            await this.usersService.findOneById(req.user.userId)
        );
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update User' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User has been updated',
        type: User
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No user with this id'
    })
    async update(
        @Param('id') id: ObjectId,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req
    ): Promise<User> {
        const user = await this.usersService.updateUser(
            id,
            updateUserDto,
            req.user
        );
        return plainToClass(User, user);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete User' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'User has been deleted'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No user with this id'
    })
    @HttpCode(204)
    async remove(@Param('id') id: ObjectId, @Request() req): Promise<void> {
        await this.usersService.remove(id, req.user);
    }
}
