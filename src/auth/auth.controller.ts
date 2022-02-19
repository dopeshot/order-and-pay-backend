import {
    Body,
    Controller,
    HttpStatus,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/jwt.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './strategies/jwt/public.decorator';
import { LocalAuthGuard } from './strategies/local/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register new user' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The user has been created succesfully',
        type: AccessTokenDto
    })
    async registerUser(
        @Body() credentials: RegisterDto
    ): Promise<AccessTokenDto> {
        return await this.authService.registerUser(credentials);
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'User login with mail and password' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The user has loggin in correctly',
        type: AccessTokenDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'The client has provided invalid credentials'
    })
    @UseGuards(LocalAuthGuard)
    async login(@Request() req): Promise<AccessTokenDto> {
        return await this.authService.createLoginPayload(req.user);
    }
}
