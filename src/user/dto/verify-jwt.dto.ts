import { IsEmail,  IsString} from 'class-validator'
import { Schema } from 'mongoose'

export class MailVerifyJWTDto {
    @IsEmail()
    mail: string

    @IsString()
    name: string

    id: Schema.Types.ObjectId
}
