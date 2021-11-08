import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Dish } from "./entities/dish.entity";
import { DishService } from "./dish.service";
import { ObjectId } from "mongoose";

@ApiTags('dish')
@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}
  
  @Get()
  async findAll(): Promise<Dish[]> {
    return await this.dishService.findAll();
  }

  @Get(":/id")
  async findOne(id: ObjectId): Promise<Dish> {
    return await this.dishService.findById(id);
  }
}
