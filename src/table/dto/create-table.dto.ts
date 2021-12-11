import { IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreateTableDto {
    @IsString()
    @MinLength(1)
    tableNumber: string

    @IsNumber()
    @IsPositive()
    @Min(1)
    capacity: number

    @IsOptional()
    createdBy: string = "Default User"

}
