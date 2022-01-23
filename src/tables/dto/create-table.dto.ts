import {
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
    MinLength
} from 'class-validator';

export class CreateTableDto {
    @IsString()
    @MinLength(1)
    @MaxLength(8)
    tableNumber: string;

    @IsNumber()
    @IsPositive()
    @Min(1)
    capacity: number;

    @IsOptional()
    author = 'Default User';
}
