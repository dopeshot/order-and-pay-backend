import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import { Role } from '../../src/user/enums/role.enum';
import { UserStatus } from '../../src/user/enums/status.enum';
// TODO: Is this the best way to do this?
import { UsersService } from '../../src/user/users.service';

let jwtService: JwtService = new JwtService({
    secret: 'secretkey',
    signOptions: {
        expiresIn: '10h'
    }
});
const userService: UsersService = new UsersService(null, jwtService, null);
const authService: AuthService = new AuthService(null, jwtService);

let user = {
    _id: '61bb7c9983fdff2f24bf77a8',
    username: 'mock',
    email: 'mock@mock.mock',
    password: '',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    provider: ''
};

let admin = {
    _id: '61bb7c9883fdff2f24bf779d',
    username: 'admin',
    email: 'discordmod@admin.mock',
    password: '',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    provider: ''
};

export const getTestUser = async () => {
    // This ensures that altering the hashing algorith does not interfer with unit tests
    const pw = await userService.hashPassword('mock password');
    return { ...user, password: pw };
};

export const getTestAdmin = async () => {
    // This ensures that altering the hashing algorith does not interfer with unit tests
    const pw = await userService.hashPassword('mock password');
    return { ...admin, password: pw };
};

export const getJWT = async (x: any) => {
    let token = await authService.createLoginPayload(x as any);
    return token.access_token;
};

export const getUserVerify = async (user: any) => {
    let token = await userService.generateVerifyCode(user as any);
    return token;
};