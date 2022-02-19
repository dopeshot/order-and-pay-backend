import { IsOptional, IsString, Length } from 'class-validator';

export class CreateAllergenDto {
    @IsString()
    @Length(2, 20)
    title: string;

    @IsString()
    @Length(2, 50)
    @IsOptional()
    icon: string;
}
