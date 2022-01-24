import { ChoiceType } from '../enums/choice-type';

export type Radio = {
    type: ChoiceType.RADIO;
    options: number;
};
