import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DishDocument } from '../dishes/entities/dish.entity';
import { Status } from '../menus/enums/status.enum';
import { DeleteType } from '../shared/enums/delete-type.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryDocument } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);
    constructor(
        @InjectModel('Category')
        private readonly categoryModel: Model<CategoryDocument>,
        @InjectModel('Dish') private readonly dishModel: Model<DishDocument>
    ) {}

    async create(
        createCategoryDto: CreateCategoryDto
    ): Promise<CategoryDocument> {
        try {
            const category = await this.categoryModel.create(createCategoryDto);
            this.logger.debug(
                `The Category (id = ${category._id}) has been created successfully.`
            );
            return category.toObject() as CategoryDocument;
        } catch (error) {
            if (error.code == '11000') {
                this.logger.warn(
                    `Creating an category (title = ${createCategoryDto.title}) failed due to a conflict.`
                );
                throw new ConflictException(
                    'This category title already exists'
                );
            }
            this.logger.error(
                `An error has occured while creating a new category (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async findAll(): Promise<CategoryDocument[]> {
        return await this.categoryModel.find().lean();
    }

    async findOne(id: string): Promise<CategoryDocument> {
        const category: CategoryDocument = await this.categoryModel
            .findById(id)
            .lean();
        if (!category) {
            this.logger.debug(
                `A category (id = ${id}) was requested but could not be found.`
            );
            throw new NotFoundException();
        }
        return category;
    }

    async findRefs(id: string): Promise<DishDocument[]> {
        return await this.dishModel.find({ category: id }).lean();
    }

    async update(
        id: string,
        updateCategoryDto: UpdateCategoryDto
    ): Promise<CategoryDocument> {
        let category: CategoryDocument;
        try {
            category = await this.categoryModel
                .findByIdAndUpdate(id, updateCategoryDto, { new: true })
                .lean();
        } catch (error) {
            if (error.code === 11000) {
                this.logger.warn(
                    `Updating a category (title = ${updateCategoryDto.title}) failed due to a conflict.`
                );
                throw new ConflictException(
                    'This category title already exists'
                );
            }

            this.logger.error(
                `An error has occured while updating a category (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
        if (!category) {
            this.logger.warn(
                `A category (id = ${id}) update failed  as it could not be found.`
            );
            throw new NotFoundException();
        }

        this.logger.debug(
            `The category (id = ${id}) has been updated successfully.`
        );
        return category;
    }

    async remove(id: string, type: DeleteType): Promise<void> {
        // Hard delete
        // MD: Delete references too
        if (type === DeleteType.HARD) {
            const category = await this.categoryModel.findByIdAndDelete(id);

            if (!category) {
                this.logger.warn(
                    `A category (id = ${id}) was requested but could not be found.`
                );
                throw new NotFoundException();
            }

            // Delete dishes
            await this.dishModel.deleteMany({ category: id });

            this.logger.debug(
                `The category (id = ${id}) has been deleted successfully.`
            );
            return;
        }

        // Soft delete
        const category = await this.categoryModel.findByIdAndUpdate(id, {
            status: Status.DELETED
        });

        if (!category) {
            this.logger.warn(
                `A category (id = ${id}) was requested but could not be found.`
            );
            throw new NotFoundException();
        }

        this.logger.debug(
            `The category (id = ${id}) has been soft deleted successfully.`
        );

        return;
    }
}
