import { ObjectId } from 'mongoose';

export class OrderSSEPayload {
    id: ObjectId;
    tableId: ObjectId;
    items: {
        dishId: ObjectId;
        count: number;
        note: string;
        choices: (PickedRadio | PickedCheckbox)[];
    };
}

export type PickedRadio = {
    id: number;
    type: string;
    valueId: number;
};

export type PickedCheckbox = {
    id: number;
    type: string;
    valueId: number[];
};
