import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { Dish } from '../dishes/entities/dish.entity';
import { DeleteType } from '../shared/enums/delete-type.enum';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@ApiTags('categories')
@Controller('categories')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @ApiOperation({ summary: 'Post a category', tags: ['categories'] })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The category has been created',
        type: Category
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'The category title already exists'
    })
    @Post()
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return plainToClass(
            Category,
            await this.categoriesService.create(createCategoryDto)
        );
    }

    @ApiOperation({ summary: 'Get all categories', tags: ['categories'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The categories available in the database',
        type: Category,
        isArray: true
    })
    @Get()
    async findAll() {
        return plainToClass(Category, await this.categoriesService.findAll());
    }

    @ApiOperation({ summary: 'Get one category', tags: ['categories'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The category has been found',
        type: Category
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The category could not be found'
    })
    @Get(':id')
    async findOne(@Param() { id }: MongoIdDto) {
        return plainToClass(Category, await this.categoriesService.findOne(id));
    }

    @ApiOperation({
        summary: 'Get dishes that reference the label',
        tags: ['categories']
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The dishes referencing the label',
        type: Dish,
        isArray: true
    })
    @Get(':id/refs')
    async findRefs(@Param() { id }: MongoIdDto) {
        return plainToClass(Dish, await this.categoriesService.findDishes(id));
    }

    @ApiOperation({ summary: 'Patch a category', tags: ['categories'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The category has been updated',
        type: Category
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The category could not be found'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'The category title already exists'
    })
    @Patch(':id')
    async update(
        @Param() { id }: MongoIdDto,
        @Body() updateCategoryDto: UpdateCategoryDto
    ) {
        return plainToClass(
            Category,
            await this.categoriesService.update(id, updateCategoryDto)
        );
    }

    @ApiOperation({ summary: 'Delete a category', tags: ['categories'] })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'The category has been deleted'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No category with this id exists'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async remove(@Param() { id }: MongoIdDto, @Query('type') type: DeleteType) {
        await this.categoriesService.remove(id, type);
    }
}
