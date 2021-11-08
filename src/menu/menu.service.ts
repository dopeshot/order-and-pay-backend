import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Menu, MenuDocument } from "./entities/menu.entity";

@Injectable()
export class MenuService {
  constructor( @InjectModel('Menu') private menuSchema: Model<MenuDocument>) { }

    /**
   * Find all user
   * @returns Array containig all menus
   */
     async findAll(): Promise<Menu[]> {
        return await this.menuSchema.find()
      }

      async findCurrent(timestamp: number): Promise<Menu>{
        //TODO: This has to be implemented once timestamps are implemented
        return this.menuSchema.findOne().select([ "name", "dishes", "categories", "-_id" ]).populate('categories', 'name description _id').populate('dishes', 'name price category allergens labels description -_id')
      }
}