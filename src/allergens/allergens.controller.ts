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
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Dish } from '../dishes/entities/dish.entity';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { AllergensService } from './allergens.service';
import { CreateAllergenDto } from './dto/create-allergen.dto';
import { UpdateAllergenDto } from './dto/update-allergen.dto';
import { Allergen } from './entities/allergen.entity';

@Controller('allergens')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@ApiTags('allergens')
export class AllergensController {
    constructor(private readonly allergensService: AllergensService) {}

    @Post()
    @ApiOperation({ summary: 'Post an allergen', tags: ['allergen'] })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The allergen has been created',
        type: Allergen
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'The label title already exists'
    })
    async create(@Body() createAllergenDto: CreateAllergenDto) {
        return new Allergen(
            await this.allergensService.create(createAllergenDto)
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all allergens', tags: ['allergens'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The allergens available in the database',
        type: Allergen,
        isArray: true
    })
    async findAll() {
        return (await this.allergensService.findAll()).map(
            (allergens) => new Allergen(allergens)
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get one allergen', tags: ['allergens'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The allergen has been found',
        type: Allergen
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The allergen could not be found'
    })
    async findOne(@Param() { id }: MongoIdDto) {
        return new Allergen(await this.allergensService.findOne(id));
    }

    @ApiOperation({
        summary: 'Get dishes that reference the allergen',
        tags: ['allergens']
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The dishes referencing the allergen',
        type: Dish,
        isArray: true
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The allergen could not be found'
    })
    @Get(':id/refs')
    async findRefs(@Param() { id }: MongoIdDto) {
        return await this.allergensService.findRefs(id);
        //return new Allergen(await this.allergensService.findRefs(id));
    }

    @ApiOperation({ summary: 'Patch a allergen', tags: ['allergens'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The allergen has been updated',
        type: Allergen
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The allergen could not be found'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'The allergen title already exists'
    })
    @Patch(':id')
    async update(
        @Param() { id }: MongoIdDto,
        @Body() updateAllergenDto: UpdateAllergenDto
    ) {
        return new Allergen(
            await this.allergensService.update(id, updateAllergenDto)
        );
    }

    @ApiOperation({
        summary: 'Patch dishes that reference the allergen',
        tags: ['allergens']
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'The allergen has been deleted'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The allergen could not be found'
    })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param() { id }: MongoIdDto) {
        return await this.allergensService.remove(id);
    }
}
