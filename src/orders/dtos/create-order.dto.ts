import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsNumber,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested
} from 'class-validator';
import { Item } from '../entities/order.entity';

export class CreateOrderDto {
    @IsString()
    @MinLength(1)
    @MaxLength(8)
    tableNumber: string;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => Item)
    items: Item[];

    @IsNumber()
    @Min(0)
    price: number;
}
