import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { CategoryService } from './category.service';
import { CategoryDocument } from './entities/category.entity';

@ApiTags('category')
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get()
    async findAll(): Promise<CategoryDocument[]> {
        return this.categoryService.findAll();
    }
}
