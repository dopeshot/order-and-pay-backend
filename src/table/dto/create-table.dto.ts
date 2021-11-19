import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateTableDto {
    @IsNumber()
    @IsNotEmpty()
    tableNumber: number

    @IsNumber()
    @IsNotEmpty()
    capacity: number

    @IsOptional()
    createdBy: string = "Default User"

}
