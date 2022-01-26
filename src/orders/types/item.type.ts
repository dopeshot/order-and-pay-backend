import { Prop } from '@nestjs/mongoose';
import { Expose, Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested
} from 'class-validator';
import { ObjectId, SchemaTypes } from 'mongoose';
import { ChoiceType } from '../enums/choice-type.enum';

export class Item {
    @Expose()
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Dish', required: true })
    dish: ObjectId;

    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    count: number;

    @Expose()
    @Prop()
    @ValidateNested()
    @Type(() => PickedChoices)
    pickedChoices: PickedChoices[];

    @Expose()
    @Prop()
    @IsString()
    @MaxLength(140)
    @IsOptional()
    note: string;
}

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
    @IsArray()
    @IsNumber({}, { each: true })
    valueId: number[];
}
