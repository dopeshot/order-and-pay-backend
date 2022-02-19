import { OmitType } from '@nestjs/mapped-types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform, Type } from 'class-transformer';
import { Document, ObjectId, SchemaTypes, Types } from 'mongoose';
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
    @Prop({ required: true })
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
    @Prop({ type: SchemaTypes.ObjectId, ref: Category.name, required: true })
    @Transform((params) => params.obj.categoryId.toString())
    categoryId: Category;

    @Expose()
    @Prop({ type: [{ type: Types.ObjectId, ref: Allergen.name }] })
    @Transform((params) =>
        params.obj.allergenIds.map((allergen) => allergen.toString())
    )
    allergenIds: Allergen[];

    @Expose()
    @Prop({ type: [{ type: Types.ObjectId, ref: Label.name }] })
    @Transform((params) => params.obj.labelIds.map((label) => label.toString()))
    labelIds: Label[];
}

export type DishDocument = Dish & Document;
export class DishPopulated extends OmitType(Dish, ['allergenIds', 'labelIds']) {
    // TODO: using @Expose({name: 'allergens'}) removes the field during serialization for no reason.
    @Expose()
    @Type(() => Allergen)
    allergenIds: Allergen[];

    // TODO: using @Expose({name: 'labels'}) removes the field during serialization for no reason.
    @Expose()
    @Type(() => Label)
    labelIds: Label[];
}

export const DishSchema = SchemaFactory.createForClass(Dish);
