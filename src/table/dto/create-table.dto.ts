import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateTableDto {
    @IsNumber()
    @IsNotEmpty()
    tableNumber: number

    @IsNumber()
    @IsNotEmpty()
    capacity: number
}
