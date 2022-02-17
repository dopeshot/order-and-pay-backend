import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform, Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { CategoryPopulated } from '../../categories/entities/category.entity';
import { Status } from '../enums/status.enum';

@Schema({ timestamps: true, _id: true })
export class Menu {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: Types.ObjectId;

    @Expose()
    @Prop({ required: true, unique: true })
    title: string;

    @Expose()
    @Prop({})
    description: string;

    @Expose()
    @Prop({ default: Status.ACTIVE })
    status: Status;

    @Expose()
    @Prop({ default: false })
    isActive: boolean;
}

export type MenuDocument = Menu & Document;
export class MenuPopulated extends Menu {
    @Expose()
    @Type(() => CategoryPopulated)
    categories: CategoryPopulated[];
}
export const MenuSchema = SchemaFactory.createForClass(Menu);
