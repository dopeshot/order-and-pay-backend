import { OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { CreateLabelDto } from './create-label.dto';

export class UpdateLabelDto extends OmitType(CreateLabelDto, ['title']) {
    @IsString()
    @Length(2, 20)
    @IsOptional()
    title: string;
}
