import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { CreateLabelDto } from './create-label.dto';
// Can't use Partial type here because class-validator doesn't support generics yet
export class UpdateLabelDto extends PartialType(CreateLabelDto) {
    @IsString()
    @Length(2, 20)
    @IsOptional()
    title: string;
}
