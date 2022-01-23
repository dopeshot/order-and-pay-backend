import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    NotImplementedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { LabelDocument } from './entities/label.entity';

@Injectable()
export class LabelsService {
    constructor(
        @InjectModel('Label') private readonly labelModel: Model<LabelDocument>
    ) {}

    async create(createLabelDto: CreateLabelDto) {
        try {
            const label = await this.labelModel.create(createLabelDto);
            return label.toObject() as LabelDocument;
        } catch (error) {
            if (error.code == '11000') {
                throw new ConflictException('This table number already exists');
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async findAll() {
        // Returns array, empty array if nothing is found
        return await this.labelModel.find().lean();
    }

    async findOne(id: string) {
        const label = await this.labelModel.findById(id).lean();
        if (!label) throw new NotFoundException();
        return label;
    }

    async findRefs(id: string) {
        throw new NotImplementedException();
    }

    async update(id: string, updateLabelDto: UpdateLabelDto) {
        const label = await this.labelModel
            .findByIdAndUpdate(id, { ...updateLabelDto }, { new: true })
            .lean();
        if (!label) throw new NotFoundException();
        return label;
    }

    async remove(id: string) {
        // Only Hard delete, it is easier to create a new than retrieve the old
        // MD: Delete references too
        const menu: LabelDocument = await this.labelModel.findByIdAndDelete(id);

        if (!menu) throw new NotFoundException();

        return;
    }
}
