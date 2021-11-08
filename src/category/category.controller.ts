import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { CategoryService } from './category.service';
import { CategoryDocument } from './entities/category.entity';

@ApiTags('category')
@Controller('category')
export class CategoryController {
    constructor(private readonly dishService: CategoryService) {}

    @Get()
    async findAll(): Promise<CategoryDocument[]> {
        return this.dishService.findAll();
    }

    @Get('/:id')
    async findById(@Param("id") id: ObjectId): Promise<CategoryDocument> {
        return this.dishService.findByID(id);
    }

    @Post()
    async Create(): Promise<CategoryDocument> {
        return this.dishService.create();
    }
}
