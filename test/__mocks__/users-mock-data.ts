import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import { UserStatus } from '../../src/users/enums/status.enum';
// There may be a better way of doing this, but for now this will work
import { UsersService } from '../../src/users/users.service';

export const getJWTMockSecret = () => 'secretkey';

export const getJWTMockExpiry = () => '10h';

const jwtService: JwtService = new JwtService({
    secret: getJWTMockSecret(),
    signOptions: {
        expiresIn: getJWTMockExpiry()
    }
});
const userService: UsersService = new UsersService(null);
const authService: AuthService = new AuthService(null, jwtService);

const user = {
    _id: '61bb7c9983fdff2f24bf77a8',
    username: 'mock',
    email: 'mock@mock.mock',
    password: '',
    status: UserStatus.ACTIVE
};

const admin = {
    _id: '61bb7c9883fdff2f24bf779d',
    username: 'admin',
    email: 'discordmod@admin.mock',
    password: '',
    status: UserStatus.ACTIVE
};

export const getTestUser = async () => {
    // This ensures that altering the hashing algorithm does not interfer with unit tests
    const pw = await userService.hashPassword('mock password');
    return { ...user, password: pw };
};

export const getTestAdmin = async () => {
    // This ensures that altering the hashing algorithm does not interfer with unit tests
    const pw = await userService.hashPassword('mock password');
    return { ...admin, password: pw };
};

export const getJWT = async (x: any) => {
    const token = await authService.createLoginPayload(x as any);
    return token.access_token;
};
