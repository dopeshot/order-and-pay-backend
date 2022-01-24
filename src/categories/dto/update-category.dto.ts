import { PartialType } from '@nestjs/swagger';
import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length
} from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsOptional()
    @IsString()
    @Length(2, 30)
    title: string;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    description: string;

    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    menu: string;
}
