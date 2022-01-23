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
            return label;
        } catch (error) {
            if (error.code == '11000') {
                throw new ConflictException('This table number already exists');
            }
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
        return new NotImplementedException();
    }

    async update(id: string, updateLabelDto: UpdateLabelDto) {
        const label = await this.labelModel
            .findByIdAndUpdate(id, updateLabelDto)
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
