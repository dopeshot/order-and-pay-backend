import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class MongoIdDto {
    @IsMongoId()
    id: ObjectId;
}
