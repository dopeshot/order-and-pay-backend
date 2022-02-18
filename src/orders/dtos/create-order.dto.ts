import { OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { Item } from '../entities/order.entity';

class OrderItemDto extends PartialType(OmitType(Item, ['dishId'])) {
    @IsMongoId({ each: true })
    @IsNotEmpty()
    dishId: string;
}

export class CreateOrderDto {
    @IsString()
    @MinLength(1)
    @MaxLength(8)
    tableNumber: ObjectId;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsNumber()
    @Min(0)
    price: number;
}
