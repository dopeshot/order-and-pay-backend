import { PartialType } from '@nestjs/mapped-types';
import { CreateAllergenDto } from './create-allergen.dto';

export class UpdateAllergenDto extends PartialType(CreateAllergenDto) {}
