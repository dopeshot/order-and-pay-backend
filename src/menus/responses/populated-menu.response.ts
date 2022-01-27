import { Expose, Transform, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ObjectId } from 'mongoose';
import { Choice } from '../../categories/entities/category.entity';
import { PopulatedMenu } from '../entities/menu.entity';
import { Status } from '../enums/status.enum';

export class AllergenResponse {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    title: string;

    @Expose()
    icon: string;
}

export class LabelResponse {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    title: string;

    @Expose()
    icon: string;
}

export class PopulatedDishResponse {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    price: number;

    @Expose()
    status: Status;

    @Expose()
    image: string;

    @Expose()
    isAvailable: boolean;

    @Expose()
    @ValidateNested()
    @Type(() => AllergenResponse)
    allergens: AllergenResponse[];

    @Expose()
    @ValidateNested()
    @Type(() => LabelResponse)
    labels: LabelResponse[];
}

export class PopulatedCategoryResponse {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: ObjectId;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    icon: string;

    @Expose()
    @Type(() => Choice) // MD: Is this needed?
    choices: Choice[];

    @Expose()
    image: string;

    @Expose()
    status: Status;

    @Expose()
    menu: string;

    @Expose()
    @ValidateNested()
    @Type(() => PopulatedDishResponse)
    dishes: PopulatedDishResponse[];
}

export class PopulatedMenuResponse {
    @Expose()
    @Transform((params) => params.obj._id.toString())
    _id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    status: Status;

    @Expose()
    isActive: boolean;

    @Expose()
    @ValidateNested()
    @Type(() => PopulatedCategoryResponse)
    categories: PopulatedCategoryResponse[];

    constructor(partial: Partial<PopulatedMenu>) {
        Object.assign(this, partial);
    }
}
