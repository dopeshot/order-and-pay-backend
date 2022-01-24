import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { Menu } from '../../menus/entities/menu.entity';
import { Status } from '../../menus/enums/status.enum';
import { Timestamps } from '../../shared/global-validation/types/timestamps';
import { Checkbox } from '../types/choice-checkbox';
import { Radio } from '../types/choice-radio';

@Schema()
export class Choice {
    @Expose()
    _id: number;

    @Expose()
    @Prop({ required: true })
    title: string;

    @Expose()
    @Prop()
    default?: number;
}

@Schema({ timestamps: true })
export class Category {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Prop({ required: true, unique: true })
    title: string;

    @Expose()
    @Prop({ required: true })
    description: string;

    @Expose()
    @Prop()
    icon: string;

    @Expose()
    @Prop({ type: Choice }) // MD: Is this needed?
    choices: Choice[] & (Checkbox | Radio);

    @Expose()
    @Prop()
    image: string;

    @Expose()
    @Prop()
    status: Status;

    @Expose()
    @Prop({ ref: Menu.name })
    menu: string;

    constructor(partial: Partial<CategoryDocument>) {
        Object.assign(this, partial);
    }
}

export type CategoryDocument = Category & Document & Timestamps;
export const CategorySchema = SchemaFactory.createForClass(Category);
