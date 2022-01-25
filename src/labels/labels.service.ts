import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    NotImplementedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DishDocument } from '../dishes/entities/dish.entity';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { LabelDocument } from './entities/label.entity';

@Injectable()
export class LabelsService {
    constructor(
        @InjectModel('Label') private readonly labelModel: Model<LabelDocument>
    ) {}

    async create(createLabelDto: CreateLabelDto): Promise<LabelDocument> {
        try {
            const label = await this.labelModel.create(createLabelDto);
            return label.toObject() as LabelDocument;
        } catch (error) {
            if (error.code == '11000') {
                throw new ConflictException('This label title already exists');
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async findAll(): Promise<LabelDocument[]> {
        // Returns array, empty array if nothing is found
        return await this.labelModel.find().lean();
    }

    async findOne(id: string): Promise<LabelDocument> {
        const label: LabelDocument = await this.labelModel.findById(id).lean();
        if (!label) throw new NotFoundException();
        return label;
    }

    async findRefs(id: string): Promise<DishDocument[]> {
        throw new NotImplementedException();
    }

    async update(
        id: string,
        updateLabelDto: UpdateLabelDto
    ): Promise<LabelDocument> {
        let label: LabelDocument;
        try {
            label = await this.labelModel
                .findByIdAndUpdate(id, updateLabelDto, { new: true })
                .lean();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('This label title already exists');
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
        if (!label) throw new NotFoundException();
        return label;
    }

    async remove(id: string): Promise<void> {
        // Only Hard delete, it is easier to create a new than retrieve the old
        // MD: Delete references too
        const label: LabelDocument = await this.labelModel.findByIdAndDelete(
            id
        );

        if (!label) throw new NotFoundException();

        return;
    }
}
