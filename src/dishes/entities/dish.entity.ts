import { OmitType } from '@nestjs/mapped-types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform, Type } from 'class-transformer';
import { Document, ObjectId, Types } from 'mongoose';
import { Allergen } from '../../allergens/entities/allergen.entity';
import { Category } from '../../categories/entities/category.entity';
import { Label } from '../../labels/entities/label.entity';
import { Status } from '../../shared/enums/status.enum';

@Schema({ timestamps: true })
export class Dish {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Prop({ required: true, unique: true })
    title: string;

    @Expose()
    @Prop()
    description: string;

    @Expose()
    @Prop({ required: true })
    price: number;

    @Expose()
    @Prop({ default: Status.ACTIVE })
    status: Status;

    @Expose()
    @Prop()
    image: string;

    @Expose()
    @Prop({ required: true, default: true })
    isAvailable: boolean;

    @Expose()
    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    @Transform((params) => params.obj.category.toString())
    category: Category;

    @Expose()
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Allergen' }] })
    @Transform((params) =>
        params.obj.allergens.map((allergen) => allergen.toString())
    )
    allergens: Allergen[];

    @Expose()
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Label' }] })
    @Transform((params) => params.obj.labels.map((label) => label.toString()))
    labels: Label[];
}

export type DishDocument = Dish & Document;
export class DishPopulated extends OmitType(Dish, ['allergens', 'labels']) {
    @Expose()
    @Type(() => Allergen)
    allergens: Allergen;

    @Expose()
    @Type(() => Label)
    labels: Label;
}

export const DishSchema = SchemaFactory.createForClass(Dish);
