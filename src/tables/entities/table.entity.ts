import { OmitType } from '@nestjs/mapped-types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { Timestamps } from '../../shared/global-validation/types/timestamps';

@Schema({ timestamps: true, _id: true })
export class Table {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Prop({ required: true, unique: true })
    tableNumber: string;

    @Expose()
    @Prop({ required: true })
    capacity: number;

    @Expose()
    updatedAt: Date;
}

export class OrderTable extends OmitType(Table, ['tableNumber']) {
    @Expose()
    @Prop({ required: true })
    tableNumber: string;
}

export type TableDocument = Table & Document & Timestamps;
export const TableSchema = SchemaFactory.createForClass(Table);
