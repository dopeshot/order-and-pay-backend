import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { DishesService } from '../dishes/dishes.service';
import { DishDocument } from '../dishes/entities/dish.entity';
import { CreateAllergenDto } from './dto/create-allergen.dto';
import { UpdateAllergenDto } from './dto/update-allergen.dto';
import { AllergenDocument } from './entities/allergen.entity';
@Injectable()
export class AllergensService {
    private readonly logger = new Logger(AllergensService.name);
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
            this.logger.debug('New allergen has been created');
            return allergen.toObject() as AllergenDocument;
        } catch (error) {
            if (error.code == '11000') {
                this.logger.warn(
                    `Creating an allergen (title = ${createAllergenDto.title}) failed due to a conflict.`
                );
                throw new ConflictException(
                    'This allergen title already exists'
                );
            }

            /* istanbul ignore next */
            this.logger.error(
                `An error has occured while creating a new allergen (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async findAll(): Promise<AllergenDocument[]> {
        // Returns array, empty array if nothing is found
        return await this.allergenModel.find().lean();
    }

    async findOne(id: ObjectId): Promise<AllergenDocument> {
        const allergen: AllergenDocument = await this.allergenModel
            .findById(id)
            .lean();
        if (!allergen) {
            this.logger.debug(
                `A allergen with id ${id} was requested but could not be found`
            );
            throw new NotFoundException();
        }
        return allergen;
    }

    async findDishes(id: ObjectId): Promise<DishDocument[]> {
        const dishes = await this.dishesService.findByAllergen(id);
        return dishes;
    }

    async update(
        id: ObjectId,
        updateAllergenDto: UpdateAllergenDto
    ): Promise<AllergenDocument> {
        let allergen: AllergenDocument;
        try {
            allergen = await this.allergenModel
                .findByIdAndUpdate(id, updateAllergenDto, { new: true })
                .lean();
        } catch (error) {
            if (error.code === 11000) {
                this.logger.warn(
                    `Updating an allergen (title = ${updateAllergenDto.title}) failed due to a conflict.`
                );
                throw new ConflictException(
                    'This allergen title already exists'
                );
            }

            /* istanbul ignore next */
            this.logger.error(
                `An error has occured while creating a new allergen (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
        if (!allergen) {
            this.logger.warn(
                `Updating allgergen with id ${id} failed because it could not be found`
            );
            throw new NotFoundException();
        }

        this.logger.debug(`Allergen with id ${id} has been updated`);
        return allergen;
    }

    async remove(id: ObjectId): Promise<void> {
        // Only Hard delete, it is easier to create a new than retrieve the old

        // Delete references first, if this fails after the allergen delete: the references will remain
        await this.dishesService.recursiveRemoveAllergen(id);

        const allergen: AllergenDocument =
            await this.allergenModel.findByIdAndDelete(id);

        if (!allergen) {
            this.logger.warn(
                `An allgergen with id ${id} was not deleted because it could not be found`
            );
            throw new NotFoundException();
        }
        this.logger.debug(`Allgergen with id ${id} has been deleted`);

        return;
    }
}
