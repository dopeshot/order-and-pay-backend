import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DishesService } from '../dishes/dishes.service';
import { DishDocument } from '../dishes/entities/dish.entity';
import { CreateAllergenDto } from './dto/create-allergen.dto';
import { UpdateAllergenDto } from './dto/update-allergen.dto';
import { AllergenDocument } from './entities/allergen.entity';
@Injectable()
export class AllergensService {
    constructor(
        @InjectModel('Allergen')
        private readonly allergenModel: Model<AllergenDocument>,
        private readonly dishesService: DishesService
    ) {}

    async create(
        createAllergenDto: CreateAllergenDto
    ): Promise<AllergenDocument> {
        try {
            const allergen = await this.allergenModel.create(createAllergenDto);
            return allergen.toObject() as AllergenDocument;
        } catch (error) {
            if (error.code == '11000') {
                throw new ConflictException(
                    'This allergen title already exists'
                );
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async findAll(): Promise<AllergenDocument[]> {
        // Returns array, empty array if nothing is found
        return await this.allergenModel.find().lean();
    }

    async findOne(id: string): Promise<AllergenDocument> {
        const allergen: AllergenDocument = await this.allergenModel
            .findById(id)
            .lean();
        if (!allergen) throw new NotFoundException();
        return allergen;
    }

    async findDishes(id: string): Promise<DishDocument[]> {
        const dishes = await this.dishesService.findByAllergen(id);
        return dishes;
    }

    async update(
        id: string,
        updateAllergenDto: UpdateAllergenDto
    ): Promise<AllergenDocument> {
        let allergen: AllergenDocument;
        try {
            allergen = await this.allergenModel
                .findByIdAndUpdate(id, updateAllergenDto, { new: true })
                .lean();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException(
                    'This allergen title already exists'
                );
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
        if (!allergen) throw new NotFoundException();
        return allergen;
    }

    async remove(id: string): Promise<void> {
        // Only Hard delete, it is easier to create a new than retrieve the old

        // Delete references first, if this fails after the allergen delete: the references will remain
        await this.dishesService.recursiveRemoveAllergen(id);

        const allergen: AllergenDocument =
            await this.allergenModel.findByIdAndDelete(id);

        if (!allergen) throw new NotFoundException();

        return;
    }
}
