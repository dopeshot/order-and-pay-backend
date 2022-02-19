import { OmitType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { Choice } from '../../categories/entities/category.entity';
import { Item, Order } from '../entities/order.entity';

export class readableItem extends OmitType(Item, ['pickedChoices', 'dishId']) {
    @Expose({ name: 'dishName' })
    @Transform((params) => params.obj.title.toString())
    dishId: string;

    pickedChoices: Choice[];
}

export class readableOrder extends OmitType(Order, ['tableId', 'items']) {
    @Expose({ name: 'tableNumber' })
    @Transform((params) => params.obj.tableNumber.toString())
    tableId: string;

    @Expose()
    items: readableItem[];
}
