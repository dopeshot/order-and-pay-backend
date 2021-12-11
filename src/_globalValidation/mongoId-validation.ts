import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import {ObjectId} from 'mongodb'

@Injectable()
export class ValidateMongoId implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string{
    console.log("Validating WOOOP WOOP")
      if(ObjectId.isValid(value)){
          if((String)(new ObjectId(value)) === value)
              return value;        
          throw new BadRequestException
      }
      throw new BadRequestException
  
  };
}