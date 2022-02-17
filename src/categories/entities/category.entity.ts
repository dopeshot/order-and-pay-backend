import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PartialType } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    ValidateNested
} from 'class-validator';
import { Document, ObjectId } from 'mongoose';
import { DishPopulated } from '../../dishes/entities/dish.entity';
import { Menu } from '../../menus/entities/menu.entity';
import { Status } from '../../menus/enums/status.enum';
import { ChoiceType } from '../enums/choice-type';

export class Option {
    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @Expose()
    @Prop()
    @IsString()
    @Length(2, 30)
    name: string;

    @Expose()
    @Prop()
    @IsNumber()
    price: number;
}

export class Choice {
    @IsNumber()
    @IsNotEmpty()
    @Expose()
    @Prop()
    id: number;

    @Expose()
    @IsString()
    @Length(2, 30)
    @Prop({ required: true })
    title: string;

    @Expose()
    @IsOptional()
    @Prop()
    default?: number;

    @Expose()
    @IsEnum(ChoiceType)
    @Prop()
    type: ChoiceType;

    @Expose()
    @Prop()
    @ValidateNested()
    @Type(() => Option)
    options: Option[];
}

@Schema({ timestamps: true })
export class Category {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    @Prop({ required: true, unique: true })
    title: string;

    @Expose()
    @Prop({ required: true })
    description: string;

    @Expose()
    @Prop()
    icon: string;

    @Expose()
    @Prop()
    @Type(() => Choice) // MD: Is this needed?
    choices: Choice[];

    @Expose()
    @Prop()
    image: string;

    @Expose()
    @Prop({ default: Status.ACTIVE })
    status: Status;

    @Expose()
    @Prop({ ref: Menu.name })
    menu: string;
}

export type CategoryDocument = Category & Document;
export class CategoryPopulated extends PartialType(Category) {
    @Expose()
    @Type(() => DishPopulated)
    dishes: DishPopulated[];
}
export const CategorySchema = SchemaFactory.createForClass(Category);
