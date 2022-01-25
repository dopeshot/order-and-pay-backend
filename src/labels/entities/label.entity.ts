import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

@Schema({ timestamps: true, _id: true })
export class Label {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Prop({ required: true, unique: true })
    title: string;

    @Expose()
    @Prop()
    icon: string;

    constructor(partial: Partial<LabelDocument>) {
        Object.assign(this, partial);
    }
}

export type LabelDocument = Label & Document;
export const LabelSchema = SchemaFactory.createForClass(Label);
