import {
    IsArray,
    IsBoolean,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    Min
} from 'class-validator';

export class CreateDishDto {
    @IsString()
    @Length(2, 30)
    title: string;

    @IsString()
    @Length(2, 200)
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsString()
    @Length(0, 200) // Also allow to have an empty string to "overwrite" a previous image to be "empty"
    image: string;

    @IsOptional()
    @IsBoolean()
    isAvailable = true;

    @IsMongoId({ each: true })
    @IsNotEmpty()
    categoryId: string;

    @IsArray()
    @IsMongoId({ each: true })
    allergenIds: string[];

    @IsArray()
    @IsMongoId({ each: true })
    labelIds: string[];
}
