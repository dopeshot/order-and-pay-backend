import { ObjectId } from 'mongoose';

export class OrderSSEPayload {
    id: ObjectId;
    tableId: ObjectId;
    items: {
        dishId: string;
        count: number;
        note: string;
        choices: {
            id: number;
            // coffee: TODO: change type to choices enum once order module is implemented
            type: string;
            valueId: number | number[];
        }[];
    };
}
