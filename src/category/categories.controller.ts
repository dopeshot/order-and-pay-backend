import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { CategoriesService } from './categories.service';
import { CategoryDocument } from './entities/category.entity';

@ApiTags('category')
@Controller('category')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService) {}

    @Get()
    async findAll(): Promise<CategoryDocument[]> {
        return this.categoryService.findAll();
    }
}
