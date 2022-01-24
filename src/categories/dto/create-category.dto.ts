import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length
} from 'class-validator';
import { Choice } from '../entities/category.entity';

export class CreateCategoryDto {
    @IsString()
    @Length(2, 30)
    title: string;

    @IsString()
    @Length(2, 200)
    description: string;

    @IsOptional()
    choices: Choice[];

    @IsOptional()
    @IsString()
    @Length(2, 100)
    icon: string;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    image: string;

    @IsMongoId()
    @IsNotEmpty()
    menu: string;
}
