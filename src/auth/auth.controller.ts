import {
    Body,
    Controller,
    HttpStatus,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ENVGuard } from '../shared/guards/environment.guard';
import { userDataFromProvider } from '../users/interfaces/userDataFromProvider.interface';
import { AuthService } from './auth.service';
import { GoogleToken } from './dto/google-token.dto';
import { AccessTokenDto } from './dto/jwt.dto';
import { RegisterDto } from './dto/register.dto';
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

    @Post('login')
    @ApiOperation({ summary: 'User login with mail and password' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The user has loggin in correctly',
        type: AccessTokenDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'The client has provided invalid credentials',
        type: AccessTokenDto
    })
    @UseGuards(LocalAuthGuard)
    async login(@Request() req): Promise<AccessTokenDto> {
        return await this.authService.createLoginPayload(req.user);
    }

    @Post('/google')
    @ApiOperation({ summary: 'Handle user data provided by google' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The user has logged in/has been created correctly',
        type: AccessTokenDto
    })
    async googleLogin(@Body() token: GoogleToken): Promise<AccessTokenDto> {
        const user: userDataFromProvider =
            await this.authService.getGoogleUserdata(token);
        return await this.authService.handleProviderLogin(user);
    }

    @Post('/testGoogle')
    @UseGuards(ENVGuard)
    @ApiOperation({
        summary:
            'Skip oauth fetch from google and therefore enable testing methods'
    })
    async testgoogleLogin(
        @Body() user: userDataFromProvider
    ): Promise<AccessTokenDto> {
        return await this.authService.handleProviderLogin(user);
    }
}
