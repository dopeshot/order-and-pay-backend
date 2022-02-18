import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
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
import { Table } from '../../tables/entities/table.entity';
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
    @IsMongoId()
    @IsNotEmpty()
    @Prop({ type: SchemaTypes.ObjectId, ref: Dish.name, required: true })
    dishId: Dish;

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
    @Prop({ type: SchemaTypes.ObjectId, ref: Table.name, required: true })
    tableId: Table;

    @Expose()
    @Prop({ required: true })
    @Type(() => Item)
    items: Item[];

    @Expose()
    @Prop({ required: true })
    PaymentStatus: PaymentStatus;

    @Expose()
    @Prop({ default: OrderStatus.RECEIVED })
    Status: OrderStatus;

    @Expose()
    @Prop({ required: true })
    price: number;
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);
