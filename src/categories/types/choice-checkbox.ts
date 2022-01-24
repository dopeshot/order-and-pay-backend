import { ChoiceType } from '../enums/choice-type';

export type Checkbox = {
    type: ChoiceType.CHECKBOX;
    options: number;
};
