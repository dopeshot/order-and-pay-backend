import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    NotImplementedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAllergenDto } from './dto/create-allergen.dto';
import { UpdateAllergenDto } from './dto/update-allergen.dto';
import { AllergenDocument } from './entities/allergen.entity';
@Injectable()
export class AllergensService {
    constructor(
        @InjectModel('Allergen')
        private readonly allergenModel: Model<AllergenDocument>
    ) {}

    async create(createAllergenDto: CreateAllergenDto) {
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

    async findAll() {
        // Returns array, empty array if nothing is found
        return await this.allergenModel.find().lean();
    }

    async findOne(id: string) {
        const allergen = await this.allergenModel.findById(id).lean();
        if (!allergen) throw new NotFoundException();
        return allergen;
    }

    async findRefs(id: string) {
        throw new NotImplementedException();
    }

    async update(id: string, updateAllergenDto: UpdateAllergenDto) {
        // MD: TODO this try catch is really unclean in terms of catching NotFound
        try {
            const allergen = await this.allergenModel
                .findByIdAndUpdate(id, { ...updateAllergenDto }, { new: true })
                .lean();
            if (!allergen) throw new NotFoundException();
            return allergen;
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException(
                    'This allergen title already exists'
                );
            } else {
                if (error.status === 404) {
                    throw error;
                }
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async remove(id: string) {
        // Only Hard delete, it is easier to create a new than retrieve the old
        // MD: Delete references too
        const menu: AllergenDocument =
            await this.allergenModel.findByIdAndDelete(id);

        if (!menu) throw new NotFoundException();

        return;
    }
}
