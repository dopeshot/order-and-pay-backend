import { ObjectId } from 'mongoose';
import { Role } from '../../users/enums/role.enum';

export class JwtPayloadDto {
    sub: ObjectId;
    username: string;
    role: Role;
}

export class JwtUserDto {
    _id: ObjectId;
    username: string;
    role: Role;
}

export class AccessTokenDto {
    access_token: string;
}
