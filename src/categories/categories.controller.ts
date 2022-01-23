import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryDocument } from './entities/category.entity';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoryService: CategoriesService) {}

    @Get()
    async findAll(): Promise<CategoryDocument[]> {
        return this.categoryService.findAll();
    }
}
