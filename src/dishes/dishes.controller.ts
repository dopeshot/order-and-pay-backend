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
import { DeleteType } from '../shared/enums/delete-type.enum';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish-dto';
import { UpdateDishDto } from './dto/update-dish-dto';
import { Dish } from './entities/dish.entity';

@ApiTags('dishes')
@Controller('dishes')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class DishesController {
    constructor(private readonly dishesService: DishesService) {}

    @ApiOperation({ summary: 'Post a dish', tags: ['dishes'] })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The dish has been created',
        type: Dish
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'The dish title already exists'
    })
    @Post()
    async create(@Body() createDishDto: CreateDishDto) {
        return new Dish(await this.dishesService.create(createDishDto));
    }

    @ApiOperation({ summary: 'Get all dishes', tags: ['dishes'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The dishes available in the database',
        type: Dish,
        isArray: true
    })
    @Get()
    async findAll() {
        return (await this.dishesService.findAll()).map(
            (dish) => new Dish(dish)
        );
    }

    @ApiOperation({ summary: 'Get one dish', tags: ['dishes'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The dish has been found',
        type: Dish
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The dish could not be found'
    })
    @Get(':id')
    async findOne(@Param() { id }: MongoIdDto) {
        return new Dish(await this.dishesService.findOne(id));
    }

    @ApiOperation({ summary: 'Patch a dish', tags: ['dishes'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The dish has been updated',
        type: Dish
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The dish could not be found'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'The dish title already exists'
    })
    @Patch(':id')
    async update(
        @Param() { id }: MongoIdDto,
        @Body() updateDishDto: UpdateDishDto
    ) {
        return new Dish(await this.dishesService.update(id, updateDishDto));
    }

    @ApiOperation({ summary: 'Delete a dish', tags: ['dishes'] })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'The dish has been deleted'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No dish with this id exists'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async remove(@Param() { id }: MongoIdDto, @Query('type') type: DeleteType) {
        return await this.dishesService.remove(id, type);
    }
}
