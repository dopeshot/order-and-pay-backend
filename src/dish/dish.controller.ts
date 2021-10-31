import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Dish, DishDocument } from "./entities/dish.entity";

@Injectable()
export class MenuService {
  constructor( @InjectModel('Dish') private menuSchema: Model<DishDocument>) { }

    /**
   * Find all user
   * @returns Array containig all menus
   */
     async findAll(): Promise<Dish[]> {
        return await this.menuSchema.find()
      }

      async findCurrent(timestamp: number): Promise<Dish>{
        //TODO: This has to be implemented once timestamps are implemented
        return await this.menuSchema.findOne().populate('dishes', 'name')
      }

    async createMenu(){
      const menu: DishDocument = new this.menuSchema({
        "name": "testMenu",
        "description": "test description",
        "dishes": [],
        "timeslot": ["morning","evening"]
      })
      const result = await menu.save()
      console.log(result)
    }
}