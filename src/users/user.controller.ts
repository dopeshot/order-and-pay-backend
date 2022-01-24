import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ValidationPipe,
    UseGuards,
    Request,
    Render,
    Res,
    Response,
    HttpCode
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from '../auth/roles/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { VerifyJWTGuard } from './guards/mailVerify-jwt.guard';
import { returnUser } from './types/returnUser.type';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UsersService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async findAll(): Promise<returnUser[]> {
        const users = await this.userService.findAll();
        users.forEach(async (user) => {
            await this.userService.transformToReturn(user);
        });

        return users;
    }

    @Get('/profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req): Promise<returnUser> {
        const user = await this.userService.veryfiyUser(req.user);
        return await this.userService.transformToReturn(user);
    }

    @Get('/resend-account-verification')
    @UseGuards(JwtAuthGuard)
    async regenerateVerify(@Request() req): Promise<void> {
        const userData = await this.userService.findOneById(req.user._id);
        await this.userService.createVerification(userData);
    }

    @Get('/verify-account')
    @UseGuards(VerifyJWTGuard)
    @Render('MailVerify')
    async verifyMail(@Request() req): Promise<returnUser> {
        const user = await this.userService.veryfiyUser(req.user);
        return await this.userService.transformToReturn(user);
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: ObjectId,
        @Body(
            new ValidationPipe({
                // whitelist will strip all fields which are not in the DTO
                whitelist: true
            })
        )
        updateUserDto: UpdateUserDto,
        @Request() req
    ): Promise<returnUser> {
        const user = await this.userService.updateUser(
            id,
            updateUserDto,
            req.user
        );
        return await this.userService.transformToReturn(user);
    }

    @Delete('/:id')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: ObjectId, @Request() req): Promise<void> {
        await this.userService.remove(id, req.user);
    }
}
