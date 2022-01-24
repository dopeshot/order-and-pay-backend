import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { CreateAllergenDto } from './create-allergen.dto';

export class UpdateAllergenDto extends OmitType(CreateAllergenDto, ['title']) {
    @IsString()
    @Length(2, 20)
    @IsOptional()
    title: string;
}
