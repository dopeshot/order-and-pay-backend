import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTableDto {
    @IsString()
    @IsNotEmpty()
    tableNumber: string

    @IsNumber()
    @IsNotEmpty()
    capacity: number

    @IsOptional()
    createdBy: string = "Default User"

}
