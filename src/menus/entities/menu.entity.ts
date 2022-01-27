import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PopulatedCategory } from '../../categories/entities/category.entity';
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
export type PopulatedMenu = Menu & { categories: PopulatedCategory[] };
export const MenuSchema = SchemaFactory.createForClass(Menu);
