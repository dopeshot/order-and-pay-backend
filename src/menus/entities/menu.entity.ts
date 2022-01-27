import { PartialType } from '@nestjs/mapped-types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform, Type } from 'class-transformer';
import { Document } from 'mongoose';
import { CategoryPopulated } from '../../categories/entities/category.entity';
import { Status } from '../enums/status.enum';

@Schema({ timestamps: true, _id: true })
export class Menu {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: string;

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

    constructor(partial: Partial<MenuDocument>) {
        Object.assign(this, partial);
    }
}

export type MenuDocument = Menu & Document;
export class MenuPopulated extends PartialType(Menu) {
    @Expose()
    @Type(() => CategoryPopulated)
    categories: CategoryPopulated[];

    constructor(partial: Partial<MenuPopulated>) {
        super();
        Object.assign(this, partial);
    }
}
export const MenuSchema = SchemaFactory.createForClass(Menu);
