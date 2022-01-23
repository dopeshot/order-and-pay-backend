import { IsEmail, IsString, IsMongoId } from 'class-validator';
import { Schema } from 'mongoose';

export class MailVerifyJWTDto {
    @IsEmail()
    mail: string;

    @IsString()
    name: string;

    @IsMongoId()
    id: Schema.Types.ObjectId;
}
