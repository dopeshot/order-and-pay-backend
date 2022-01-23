import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'mongoose';

@Schema({ timestamps: true, _id: true })
export class Label {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Prop({ required: true, unique: true })
    title: string;

    @Expose()
    @Prop() // TODO: is this required?
    icon: string;

    constructor(partial: Partial<LabelDocument>) {
        Object.assign(this, partial);
    }
}

export type LabelDocument = Label & Document;
export const LabelSchema = SchemaFactory.createForClass(Label);
