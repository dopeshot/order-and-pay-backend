import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { Document, ObjectId, SchemaTypes } from 'mongoose';
import { ChoiceType } from '../enums/choice-type.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class Payment {
    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @Expose()
    @Prop()
    @IsString()
    @Length(10)
    transactionId: string;

    @Expose()
    @Prop()
    @IsEnum(PaymentStatus)
    status: PaymentStatus;
}
export class PickedChoices {
    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @Expose()
    @IsEnum(ChoiceType)
    @Prop()
    type: ChoiceType;

    @Expose()
    @Prop()
    @IsArray()
    @IsNumber({}, { each: true })
    valueId: number[];
}

export class Item {
    @Expose()
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Dish', required: true })
    dish: ObjectId;

    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    count: number;

    @Expose()
    @Prop()
    @ValidateNested()
    @Type(() => PickedChoices)
    pickedChoices: PickedChoices[];

    @Expose()
    @Prop()
    @IsString()
    @MaxLength(140)
    @IsOptional()
    note: string;
}

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
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);
