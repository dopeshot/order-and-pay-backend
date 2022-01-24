import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Timestamps } from 'src/shared/global-validation/types/timestamps';

@Schema({ timestamps: true, _id: true })
export class Table {
    _id?: ObjectId;

    @Prop({ required: true, unique: true })
    tableNumber: string;

    @Prop({ required: true })
    capacity: number;

    // @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    @Prop({ required: true })
    author: string;
}

export type TableDocument = Table & Document & Timestamps;
export const TableSchema = SchemaFactory.createForClass(Table);
