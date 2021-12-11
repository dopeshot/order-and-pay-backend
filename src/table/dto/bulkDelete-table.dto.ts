import { ArrayMinSize, IsMongoId } from "class-validator";

export class BulkDeleteTableDto {
    @IsMongoId({ each: true })
    @ArrayMinSize(1)
    ids: string[]
}