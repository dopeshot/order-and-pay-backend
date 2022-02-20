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
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { Label, LabelDocument } from './entities/label.entity';

@Injectable()
export class LabelsService {
    private readonly logger = new Logger(LabelsService.name);
    constructor(
        @InjectModel(Label.name)
        private readonly labelModel: Model<LabelDocument>,
        private readonly dishesService: DishesService
    ) {}

    async create(createLabelDto: CreateLabelDto): Promise<LabelDocument> {
        try {
            const label = await this.labelModel.create(createLabelDto);
            this.logger.debug(
                `The label (id = ${label._id}) has been created successfully.`
            );
            return label.toObject() as LabelDocument;
        } catch (error) {
            if (error.code == '11000') {
                this.logger.warn(
                    `Creating a label (title = ${createLabelDto.title}) failed due to a conflict.`
                );
                throw new ConflictException('This label title already exists');
            }

            /* istanbul ignore next */
            this.logger.error(
                `An error has occured while creating a new label (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async findAll(): Promise<LabelDocument[]> {
        // Returns array, empty array if nothing is found
        return await this.labelModel.find().lean();
    }

    async findOne(id: ObjectId): Promise<LabelDocument> {
        const label: LabelDocument = await this.labelModel.findById(id).lean();
        if (!label) {
            this.logger.debug(
                `A label (id = ${id}) was requested but could not be found.`
            );
            throw new NotFoundException();
        }
        return label;
    }

    async findDishes(id: ObjectId): Promise<DishDocument[]> {
        const dishes = await this.dishesService.findByLabel(id);
        return dishes;
    }

    async update(
        id: ObjectId,
        updateLabelDto: UpdateLabelDto
    ): Promise<LabelDocument> {
        let label: LabelDocument;
        try {
            label = await this.labelModel
                .findByIdAndUpdate(id, updateLabelDto, { new: true })
                .lean();
        } catch (error) {
            if (error.code === 11000) {
                this.logger.warn(
                    `Updating a label (title = ${updateLabelDto.title}) failed due to a conflict.`
                );
                throw new ConflictException('This label title already exists');
            }

            /* istanbul ignore next */
            this.logger.error(
                `An error has occured while updating a label (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
        if (!label) {
            this.logger.warn(
                `Updating label (id = ${id}) failed as it could not be found.`
            );
            throw new NotFoundException();
        }

        this.logger.debug(
            `The Category (id = ${id}) has been updated successfully.`
        );
        return label;
    }

    async remove(id: ObjectId): Promise<void> {
        // Only Hard delete, it is easier to create a new than retrieve the old

        // Delete references first, if this fails after the allergen delete: the references will remain
        await this.dishesService.recursiveRemoveLabel(id);

        const label: LabelDocument = await this.labelModel.findByIdAndDelete(
            id
        );

        if (!label) {
            this.logger.warn(
                `Deleting label (id = ${id}) failed as it could not be found.`
            );
            throw new NotFoundException();
        }

        this.logger.debug(`Label (id = ${id}) has been deleted successfully.`);

        return;
    }
}
