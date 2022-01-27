import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { Allergen } from '../../allergens/entities/allergen.entity';
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
    @Prop({ ref: 'Category', required: true })
    category: string;

    @Expose()
    @Prop({ required: true, ref: 'Allergen' })
    allergens: string[];

    @Expose()
    @Prop({ required: true, ref: 'Label' })
    labels: string[];

    constructor(partial: Partial<DishDocument>) {
        Object.assign(this, partial);
    }
}

export type DishDocument = Dish & Document;
export type PopulatedDish = DishDocument & {
    allergens: Allergen[];
    labels: Label[];
};
export const DishSchema = SchemaFactory.createForClass(Dish);
