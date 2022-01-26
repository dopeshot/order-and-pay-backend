import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
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
            return category.toObject() as CategoryDocument;
        } catch (error) {
            if (error.code == '11000') {
                throw new ConflictException(
                    'This category title already exists'
                );
            }
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
        if (!category) throw new NotFoundException();
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
                throw new ConflictException(
                    'This category title already exists'
                );
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
        if (!category) throw new NotFoundException();
        return category;
    }

    async remove(id: string, type: DeleteType): Promise<void> {
        // Hard delete
        // MD: Delete references too
        if (type === DeleteType.HARD) {
            const category = await this.categoryModel.findByIdAndDelete(id);

            if (!category) throw new NotFoundException();

            // Delete dishes
            await this.dishModel.deleteMany({ category: id });
            return;
        }

        // Soft delete
        const category = await this.categoryModel.findByIdAndUpdate(id, {
            status: Status.DELETED
        });

        if (!category) throw new NotFoundException();

        return;
    }
}
