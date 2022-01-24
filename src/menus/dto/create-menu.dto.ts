import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Status } from '../enums/status.enum';

export class CreateMenuDto {
    @IsString()
    @Length(3, 32)
    title: string;

    @IsString()
    description: string;

    @IsEnum(Status)
    @IsOptional()
    status: Status;
}
