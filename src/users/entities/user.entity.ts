import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { UserStatus } from '../enums/status.enum';

@Schema({ timestamps: true })
export class User {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Prop({ required: true, unique: true })
    username: string;

    // While currently unused, saving this allows for later extension without having to alter existing users (and contact data)
    @Expose()
    @Prop({ required: true, unique: true })
    email: string;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    @Prop({ required: true })
    password: string;

    // Same as with email field
    @Prop({ default: UserStatus.ACTIVE })
    status: UserStatus;

    constructor(partial: Partial<UserDocument>) {
        Object.assign(this, partial);
    }
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
