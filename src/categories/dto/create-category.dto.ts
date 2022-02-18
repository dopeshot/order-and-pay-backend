import { Type } from 'class-transformer';
import {
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    ValidateNested
} from 'class-validator';
import { Choice } from '../entities/category.entity';

export class CreateCategoryDto {
    @IsString()
    @Length(2, 32)
    title: string;

    @IsOptional()
    @IsString()
    @Length(0, 240)
    description: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Choice)
    choices: Choice[];

    @IsOptional()
    @IsString()
    @Length(0, 32)
    icon: string;

    @IsOptional()
    @IsString()
    @Length(0, 240)
    image: string;

    @IsMongoId()
    @IsNotEmpty()
    menuId: string;
}
