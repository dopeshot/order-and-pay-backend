import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Dish } from './entities/dish.entity';
import { DishesService } from './dishes.service';
import { ObjectId } from 'mongoose';

@ApiTags('dish')
@Controller('dish')
export class DishesController {
    constructor(private readonly dishService: DishesService) {}

    @Get()
    async findAll(): Promise<Dish[]> {
        return await this.dishService.findAll();
    }

    @Get(':/id')
    async findOne(id: ObjectId): Promise<Dish> {
        return await this.dishService.findById(id);
    }
}
