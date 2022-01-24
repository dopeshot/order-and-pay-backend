import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'mongoose';

@Schema({ timestamps: true, _id: true })
export class Allergen {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Prop({ required: true, unique: true })
    title: string;

    @Expose()
    @Prop()
    icon: string;

    constructor(partial: Partial<AllergenDocument>) {
        Object.assign(this, partial);
    }
}

export type AllergenDocument = Allergen & Document;
export const AllergenSchema = SchemaFactory.createForClass(Allergen);
