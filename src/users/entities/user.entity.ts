import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { UserStatus } from '../enums/status.enum';

@Schema({ timestamps: true })
export class User {
    _id: ObjectId;

    @Prop({ required: true, unique: true })
    username: string;

    // While currently unused, saving this allows for later extension without having to alter existing users
    @Prop({ required: true, unique: true })
    email: string;

    // Need to be ignored (throws undefined error) because we want to look if provider is undefined or not, if it is undefined, required is set to true
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    @Prop({ required: () => (this.provider ? true : false) })
    password: string;

    // Same as with email field
    @Prop({ default: UserStatus.ACTIVE })
    status: UserStatus;

    @Prop()
    provider: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
