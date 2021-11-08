import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CategoryDocument } from './entities/category.entity';

@Injectable()
export class CategoryService {
    constructor( @InjectModel('Category') private categorySchema: Model<CategoryDocument>){}


    async findAll(): Promise<CategoryDocument[]> {
        return await this.categorySchema.find();
    }

    async findByID(id: ObjectId): Promise<CategoryDocument> {
        return await this.categorySchema.findById(id);
    }


    async create(): Promise<CategoryDocument> {
        let category = new this.categorySchema({
            name: 'NonAlcoholic',
            description: 'liquids to drink',
        });
        await category.save();
        category = new this.categorySchema({
            name: 'Desert',
            description: 'stuff to get fat',
        });
        await category.save();
        category = new this.categorySchema({
            name: 'Starter',
            description: 'a full meal for some',
        });
        await category.save();
        category = new this.categorySchema({
            name: 'MainCourse',
            description: 'damn this stuff is tasty',
        });
        await category.save();
        category = new this.categorySchema({
            name: 'Alcohol',
            description: 'liquids to drink a lot',
        });
        return await category.save();
    }

}
