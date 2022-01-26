import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { Item } from '../types/item.type';

export class updateOrderDto {
    @IsString()
    @MinLength(1)
    @MaxLength(8)
    @IsOptional()
    tableId: string;

    items: Item[];

    @IsString()
    payment: string;

    @IsEnum(OrderStatus)
    Status: OrderStatus;
}
