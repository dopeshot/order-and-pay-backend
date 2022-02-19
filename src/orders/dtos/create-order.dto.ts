import { OmitType } from '@nestjs/mapped-types';
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
import { Item, PickedChoices } from '../entities/order.entity';

// remove Type from orders
class PickedChoicesDto extends OmitType(PickedChoices, ['type']) {}
class ItemDto extends OmitType(Item, ['pickedChoices']) {
    @ValidateNested()
    @Type(() => PickedChoicesDto)
    pickedChoices: PickedChoicesDto[];
}

export class CreateOrderDto {
    @IsString()
    @MinLength(1)
    @MaxLength(8)
    tableNumber: string;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => ItemDto)
    items: ItemDto[];

    @IsNumber()
    @Min(0)
    price: number;
}
