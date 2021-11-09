import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { match } from "assert";
import { Model, ObjectId } from "mongoose";
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

        const menuList = await this.menuSchema.find().select("_id timeslot")
        let sortedMenus: {end: number, start: number, duration: number, id: ObjectId}[] = []
        for (let menu of menuList) {
          for (let timeslot of menu.timeslot) {
            sortedMenus.push({
              ...timeslot,
              id: menu._id,
            })
          }
        }
        sortedMenus.sort((a, b)=>{
          return a.duration - b.duration
        })

        let id:ObjectId
        for (let menu of sortedMenus) {
          if (menu.start <= timestamp && menu.end >= timestamp) {
            id = menu.id
            break
          }
        }

        if (id === undefined) {
          throw new InternalServerErrorException('No menu found for this timeslot')
        }

        return this.menuSchema.findById(id).select([ "name", "dishes", "categories", "-_id" ])
        .populate({
          path: 'categories',
          select: 'name description _id',
        })
        .populate({
          path: 'dishes',
          select: 'name price category allergens labels description -_id',
          match: {availability: true}
        })
      }

      async create(): Promise<MenuDocument> {
        const newMenu = new this.menuSchema({
          name: 'Menu 1',
          timeslot: [{end: Date.now() + 3600000, start: Date.now(), duration: 3600000}],
          dishes: [],
          categories: [],
        })
        return await newMenu.save()
      }
}