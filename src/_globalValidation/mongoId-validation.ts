import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { ObjectId } from 'mongodb';

@Injectable()
export class ValidateMongoId implements PipeTransform<string> {
    transform(value: string): string {
        if (ObjectId.isValid(value)) {
            if ((String)(new ObjectId(value)) === value)
                return value;
            throw new HttpException("The id must be a valid MongoId", 400)
        }
        throw new HttpException("The id must be a valid MongoId", 400)
    }
}