
import { Type } from "class-transformer";
import { ArrayMinSize, IsMongoId } from "class-validator";
import { ObjectId } from "mongodb";

export class BulkDeleteTableDto {
    @IsMongoId({each: true})
    @ArrayMinSize(1)
    ids: ObjectId[]
}