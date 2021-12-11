import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export class MongoIdParam {
  @IsMongoId()
  id: string;
}