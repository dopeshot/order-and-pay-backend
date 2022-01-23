import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ClassSerializerInterceptor,
    SerializeOptions,
    UseInterceptors,
    NotImplementedException,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { Label } from './entities/label.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MongoIdDto } from 'src/shared/global-validation/mongoId.dto';
import { Dish } from 'src/dish/entities/dish.entity';

@Controller('admin/labels')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@ApiTags('labels')
export class LabelsController {
    constructor(private readonly labelsService: LabelsService) {}

    @Post()
    @ApiOperation({ summary: 'Post a label', tags: ['labels'] })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The label has been created',
        type: Label
    })
    async create(@Body() createLabelDto: CreateLabelDto) {
        return new Label(await this.labelsService.create(createLabelDto));
    }

    @Get()
    @ApiOperation({ summary: 'Get all labels', tags: ['labels'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The labels available in the database',
        type: Label
    })
    async findAll() {
        return (await this.labelsService.findAll()).map(
            (label) => new Label(label)
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get one label', tags: ['labels'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The label has been found',
        type: Label
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The label could not be found'
    })
    async findOne(@Param() { id }: MongoIdDto) {
        return new Label(await this.labelsService.findOne(id));
    }

    @ApiOperation({
        summary: 'Get dishes that reference the label',
        tags: ['labels']
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The dishes referencing the label',
        type: Dish
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The label could not be found'
    })
    @Get(':id/refs')
    async findRefs(@Param() { id }: MongoIdDto) {
        throw new NotImplementedException();
        //return new Label(await this.labelsService.findRefs(id));
    }

    @ApiOperation({ summary: 'Patch label', tags: ['labels'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The label has been updated',
        type: Dish
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The label could not be found'
    })
    @Patch(':id')
    async update(
        @Param() { id }: MongoIdDto,
        @Body() updateLabelDto: UpdateLabelDto
    ) {
        return new Label(await this.labelsService.update(id, updateLabelDto));
    }

    @ApiOperation({
        summary: 'Patch dishes that reference the label',
        tags: ['labels']
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'The label has been deleted'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The label could not be found'
    })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param() { id }: MongoIdDto) {
        return await this.labelsService.remove(id);
    }
}
