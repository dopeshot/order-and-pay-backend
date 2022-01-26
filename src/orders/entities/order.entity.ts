import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';
import { OrderStatus } from '../enums/order-status.enum';
import { Item } from '../types/item.type';
import { Payment } from '../types/payment.type';
import { ItemSchema } from './item.entity';

@Schema({ timestamps: true })
export class Order {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Transform((params) => params.obj.tableId.toString())
    tableId: string;

    @Expose()
    @Prop({ required: false, type: [{ type: ItemSchema }] })
    items: Item[];

    @Expose()
    @Prop({ required: true, type: Payment })
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
