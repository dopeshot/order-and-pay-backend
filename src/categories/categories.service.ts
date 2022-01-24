import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CategoryDocument } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel('Category') private categorySchema: Model<CategoryDocument>
    ) {}

    async findAll(): Promise<CategoryDocument[]> {
        return await this.categorySchema.find();
    }
}
