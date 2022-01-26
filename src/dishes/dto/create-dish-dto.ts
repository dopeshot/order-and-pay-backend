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
    @Length(2, 100)
    image: string;

    @IsOptional()
    @IsBoolean()
    isAvailable = true;

    @IsMongoId()
    @IsNotEmpty()
    category: string;

    @IsArray()
    @IsMongoId({ each: true })
    allergens: string[];

    @IsArray()
    @IsMongoId({ each: true })
    labels: string[];
}
