import {
    IsArray,
    IsBoolean,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    ValidateNested
} from 'class-validator';

export class CreateDishDto {
    @IsString()
    @Length(2, 30)
    title: string;

    @IsString()
    @Length(2, 200)
    description: string;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    icon: string;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    image: string;

    @IsOptional()
    @IsBoolean()
    availability = true;

    @IsMongoId()
    @IsNotEmpty()
    category: string;

    @IsArray()
    @ValidateNested({ each: true })
    @IsMongoId({ each: true })
    allergens: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @IsMongoId({ each: true })
    labels: string[];
}
