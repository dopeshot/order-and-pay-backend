import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Request,
    SerializeOptions,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Get all Users' })
    @UseGuards(JwtAuthGuard)
    async getAllSets(): Promise<User[]> {
        return (await this.usersService.findAll()).map(
            (user) => new User(user)
        );
    }

    @Get('/profile')
    @ApiOperation({ summary: 'Get user profile' })
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req): Promise<User> {
        return new User(await this.usersService.findOneById(req.user.userId));
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update User' })
    @UseGuards(JwtAuthGuard)
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
        return new User(user);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete User' })
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: ObjectId, @Request() req): Promise<void> {
        await this.usersService.remove(id, req.user);
    }
}
