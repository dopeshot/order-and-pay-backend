import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class CreateTableDto {
    @IsString()
    tableNumber: string

    @IsNumber()
    @IsPositive()
    @Min(1)
    capacity: number

    @IsOptional()
    createdBy: string = "Default User"

}
