import { ObjectId } from 'mongoose';
import { ChoiceType } from '../../orders/enums/choice.enum';

export class OrderSSEPayload {
    id: ObjectId;
    tableId: ObjectId;
    items: {
        dishId: string;
        count: number;
        note: string;
        choices: {
            id: number;
            type: ChoiceType;
            valueId: number | number[];
        }[];
    };
}
