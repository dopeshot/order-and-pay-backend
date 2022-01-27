import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
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
    constructor(@InjectModel('Dish') private dishModel: Model<DishDocument>) {}

    async create(createDishDto: CreateDishDto): Promise<DishDocument> {
        try {
            const dish = await this.dishModel.create(createDishDto);
            return dish.toObject() as DishDocument;
        } catch (error) {
            if (error.code == '11000') {
                throw new ConflictException('This dish title already exists');
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async findAll(): Promise<DishDocument[]> {
        return await this.dishModel.find().lean();
    }

    async findOne(id: string): Promise<DishDocument> {
        const dish: DishDocument = await this.dishModel.findById(id).lean();
        if (!dish) throw new NotFoundException();
        return dish;
    }

    async update(
        id: string,
        updateDishDto: UpdateDishDto
    ): Promise<DishDocument> {
        let dish: DishDocument;
        try {
            dish = await this.dishModel
                .findByIdAndUpdate(id, updateDishDto, { new: true })
                .lean();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('This dish title already exists');
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
        if (!dish) throw new NotFoundException();
        return dish;
    }

    async remove(id: string, type: DeleteType): Promise<void> {
        // Hard delete
        if (type === DeleteType.HARD) {
            const dish = await this.dishModel.findByIdAndDelete(id);

            if (!dish) throw new NotFoundException();

            return;
        }

        // Soft delete
        const dish = await this.dishModel.findByIdAndUpdate(id, {
            status: Status.DELETED
        });

        if (!dish) throw new NotFoundException();

        return;
    }

    async findByCategory(id: ObjectId): Promise<DishPopulated[]> {
        return await this.dishModel
            .find({ category: id })
            .populate('allergens')
            .populate('labels')
            .lean();
    }
}
