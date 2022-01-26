import {
    IsArray,
    IsMongoId,
    IsOptional,
    IsString,
    MaxLength
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { Item } from '../types/item.type';

export class CreateOrderDto {
    @IsMongoId()
    tableId: ObjectId;

    @IsArray()
    items: Item[];

    @IsString()
    payment: string;

    @IsString()
    @MaxLength(140)
    @IsOptional()
    note: string;
}
