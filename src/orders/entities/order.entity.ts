import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform, Type } from 'class-transformer';
import { Document, ObjectId, SchemaTypes } from 'mongoose';
import { OrderStatus } from '../enums/order-status.enum';
import { Item } from '../types/item.type';
import { Payment } from '../types/payment.type';

@Schema({ timestamps: true })
export class Order {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Transform((params) => params.obj.tableId.toString())
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Table', required: true })
    tableId: ObjectId;

    @Expose()
    @Prop({ required: true })
    @Type(() => Item)
    items: Item[];

    @Expose()
    @Prop({ required: true })
    @Type(() => Payment)
    PaymentStatus: Payment;

    @Expose()
    @Prop({ default: OrderStatus.RECEIVED })
    Status: OrderStatus;

    constructor(partial: Partial<OrderDocument>) {
        Object.assign(this, partial);
    }
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);
