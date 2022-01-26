import { IsString, MaxLength, MinLength } from 'class-validator';
import { Item } from '../types/item.type';

export class createOrderDto {
    @IsString()
    @MinLength(1)
    @MaxLength(8)
    tableId: string;

    items: Item[];

    @IsString()
    payment: string;
}
