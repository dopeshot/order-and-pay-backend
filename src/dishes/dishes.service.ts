import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Status } from '../menus/enums/status.enum';
import { DeleteType } from '../shared/enums/delete-type.enum';
import { CreateDishDto } from './dto/create-dish-dto';
import { UpdateDishDto } from './dto/update-dish-dto';
import { DishDocument, DishPopulated } from './entities/dish.entity';

@Injectable()
export class DishesService {
    private readonly logger = new Logger(DishesService.name);

    constructor(@InjectModel('Dish') private dishModel: Model<DishDocument>) {}

    async create(createDishDto: CreateDishDto): Promise<DishDocument> {
        try {
            const dish = await this.dishModel.create(createDishDto);
            this.logger.debug(
                `The dish (id = ${dish._id}) has been created successfully.`
            );
            return dish.toObject() as DishDocument;
        } catch (error) {
            if (error.code == '11000') {
                this.logger.warn(
                    `Creating a dish (title = ${createDishDto.title}) failed due to a conflict.`
                );
                throw new ConflictException('This dish title already exists');
            }

            this.logger.error(
                `An error has occured while creating a new dish (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async findAll(): Promise<DishDocument[]> {
        return await this.dishModel.find().lean();
    }

    async findOne(id: ObjectId): Promise<DishDocument> {
        const dish: DishDocument = await this.dishModel.findById(id).lean();
        if (!dish) {
            this.logger.debug(
                `A dish (id = ${id}) was requested but could not be found.`
            );
            throw new NotFoundException();
        }
        return dish;
    }

    async findByAllergen(id: ObjectId): Promise<DishDocument[]> {
        const dishes: DishDocument[] = await this.dishModel
            .find({ allergenIds: id })
            .lean();
        return dishes;
    }

    async findByLabel(id: ObjectId): Promise<DishDocument[]> {
        const dishes: DishDocument[] = await this.dishModel
            .find({ labelIds: id })
            .lean();
        return dishes;
    }

    async findByCategory(id: ObjectId): Promise<DishDocument[]> {
        return await this.dishModel.find({ categoryId: id }).lean();
    }

    async findByCategoryAndPopulate(id: ObjectId): Promise<DishPopulated[]> {
        return await this.dishModel
            .find({ categoryId: id })
            .populate('allergenIds')
            .populate('labelIds')
            .lean();
    }

    async update(
        id: ObjectId,
        updateDishDto: UpdateDishDto
    ): Promise<DishDocument> {
        let dish: DishDocument;
        try {
            dish = await this.dishModel
                .findByIdAndUpdate(id, updateDishDto, { new: true })
                .lean();
        } catch (error) {
            if (error.code === 11000) {
                this.logger.warn(
                    `Updating a dish (title = ${updateDishDto.title}) failed due to a conflict.`
                );
                throw new ConflictException('This dish title already exists');
            }

            this.logger.error(
                `An error has occured while updating a dish (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
        if (!dish) {
            this.logger.warn(
                `Updating dish (id = ${id}) failed as it could not be found.`
            );
            throw new NotFoundException();
        }

        this.logger.debug(`Dish (id = ${id}) has been updated successfully.`);
        return dish;
    }

    async remove(id: ObjectId, type: DeleteType): Promise<void> {
        // Hard delete
        if (type === DeleteType.HARD) {
            const dish = await this.dishModel.findByIdAndDelete(id);

            if (!dish) {
                this.logger.warn(
                    `Deleting dish (id = ${id}) failed as it could not be found.`
                );
                throw new NotFoundException();
            }

            this.logger.debug(
                `The dish (id = ${id}) has been deleted successfully.`
            );

            return;
        }

        // Soft delete
        const dish = await this.dishModel.findByIdAndUpdate(id, {
            status: Status.DELETED
        });

        if (!dish) {
            this.logger.warn(
                `Deleting dish (id = ${id}) failed as it could not be found.`
            );
            throw new NotFoundException();
        }

        this.logger.debug(
            `The dish (id = ${id}) has been soft deleted successfully.`
        );

        return;
    }

    async recursiveRemoveAllergen(id: ObjectId): Promise<void> {
        const result = await this.dishModel.updateMany(
            { allergenIds: id },
            { $pull: { allergenIds: id } }
        );

        this.logger.log(
            `Allergens have been pulled from ${result.modifiedCount} Dishes. Full information: (${result})`
        );
        return;
    }

    async recursiveRemoveLabel(id: ObjectId): Promise<void> {
        const result = await this.dishModel.updateMany(
            { labelIds: id },
            { $pull: { labelIds: id } }
        );

        this.logger.log(
            `Labels have been pulled from ${result.modifiedCount} Dishes. Full information: (${result})`
        );
        return;
    }

    async recursiveRemoveByCategory(id: ObjectId): Promise<void> {
        const result = await this.dishModel.deleteMany({
            categoryId: id
        });
        this.logger.log(
            `${result.deletedCount} Dishes have been recursively been deleted after Category deletion. Full information: (${result})`
        );
        return;
    }
}
