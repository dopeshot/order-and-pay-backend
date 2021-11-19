import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId } from 'mongoose';

@Schema({ timestamps: true, _id: true })
export class Table {

    _id?: ObjectId

    @Prop({ required: true, unique: true })
    tableNumber: number


    @Prop({ required: true })
    capacity: number

    // @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    @Prop({ required: true})
    createdBy: string
}

export type TableDocument = Table & Document
export const TableSchema = SchemaFactory.createForClass(Table)