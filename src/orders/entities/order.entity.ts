import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsEmpty,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { Document, ObjectId, SchemaTypes } from 'mongoose';
import { Dish } from '../../dishes/entities/dish.entity';
import { OrderTable } from '../../tables/entities/table.entity';
import { ChoiceType } from '../enums/choice-type.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class PickedChoices {
    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @Expose()
    @IsEmpty()
    @Prop({ required: true, default: '' })
    title: string;

    @Expose()
    @IsEmpty()
    @Prop()
    type: ChoiceType;

    @Prop()
    @IsArray()
    @IsNumber({}, { each: true })
    valueId: number[];

    @Expose()
    @Prop({ default: [], required: true })
    @IsEmpty()
    optionNames: string[] = [];
}

export class Item {
    @Expose()
    @IsMongoId()
    @IsNotEmpty()
    @Prop({ type: SchemaTypes.ObjectId, ref: Dish.name, required: true })
    dishId: Dish;

    @Expose()
    @IsEmpty()
    @Prop({ required: true })
    dishName: string;

    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    count: number;

    @Expose()
    @Prop()
    @ValidateNested()
    @Type(() => PickedChoices)
    @IsArray()
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
    @Type(() => OrderTable)
    @Prop({ type: OrderTable, required: true })
    table: OrderTable;

    @Expose()
    @Prop({ required: true })
    @Type(() => Item)
    items: Item[];

    @Expose()
    @Prop({ required: true })
    paymentStatus: PaymentStatus;

    @Expose()
    @Prop({ default: OrderStatus.RECEIVED })
    status: OrderStatus;

    @Expose()
    @Prop({ required: true })
    price: number;
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);
