import { Prop, Schema } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { ObjectId, SchemaTypes } from 'mongoose';
import { ChoiceType } from '../enums/choice-type.enum';

@Schema()
export class Item {
    @Expose()
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Dishes', required: true })
    dish: ObjectId;

    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    count: number;

    @Expose()
    @Prop()
    pickedChoices: [{ id: number; type: ChoiceType; valueId: [number] }];

    @Expose()
    @Prop()
    @IsString()
    @MaxLength(140)
    note: string;
}

@Schema()
export class PickedChoices {
    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @Expose()
    @IsEnum(ChoiceType)
    @Prop()
    type: ChoiceType;

    @Expose()
    @Prop()
    @ValidateNested()
    @IsNumber()
    valueId: [number];
}
