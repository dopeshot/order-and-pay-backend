import { ChoiceType } from '../enums/choice-type.enum';

export class Item {
    dishId: string;
    count: number;
    pickedChoices: (PickedRadio | PickedCheckbox)[];
    note: string;
}

export type PickedRadio = {
    id: number;
    type: ChoiceType.RADIO;
    valueId: number;
};

export type PickedCheckbox = {
    id: number;
    type: ChoiceType.CHECKBOX;
    valueId: number[];
};
