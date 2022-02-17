import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { Document } from 'mongoose';
import { Timestamps } from '../../shared/global-validation/types/timestamps';

@Schema({ timestamps: true, _id: true })
export class Table {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: string;

    @Expose()
    @Prop({ required: true, unique: true })
    tableNumber: string;

    @Expose()
    @Prop({ required: true })
    capacity: number;

    @Expose()
    // @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    @Prop({ required: true })
    author: string;

    @Expose()
    updatedAt: Date;
}

export type TableDocument = Table & Document & Timestamps;
export const TableSchema = SchemaFactory.createForClass(Table);
