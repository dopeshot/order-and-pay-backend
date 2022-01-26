import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Status } from '../enums/status.enum';

@Schema({ timestamps: true, _id: true })
export class Menu {
    @Prop({ required: true, unique: true })
    title: string;

    @Prop({})
    description: string;

    @Prop({ default: Status.ACTIVE })
    status: Status;

    @Prop({ default: false })
    isActive: boolean;
}

export type MenuDocument = Menu & Document;
export const MenuSchema = SchemaFactory.createForClass(Menu);
