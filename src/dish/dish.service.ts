import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { Dish, DishDocument } from "./entities/dish.entity";

@Injectable()
export class DishService {
  constructor( @InjectModel('Dish') private dishSchema: Model<DishDocument>) { }

   /**
   * Find all user
   * @returns Array containig all dishes
   */
    async findAll(): Promise<Dish[]> {
      return await this.dishSchema.find()
    }

    async findById(id: ObjectId): Promise<Dish> {
      return await this.dishSchema.findById(id)
    }
}