import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsString, ValidateNested } from 'class-validator';
import { ObjectId } from 'mongoose';
import { Item } from '../entities/order.entity';

export class CreateOrderDto {
    @IsMongoId()
    tableId: ObjectId;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Item)
    items: Item[];

    @IsString()
    payment: string;
}
