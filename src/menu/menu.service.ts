import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { match } from "assert";
import { Model, ObjectId } from "mongoose";
import { Menu, MenuDocument } from "./entities/menu.entity";

@Injectable()
export class MenuService {
  constructor( @InjectModel('Menu') private menuSchema: Model<MenuDocument>) { }


     async findAll(): Promise<Menu[]> {
        return await this.menuSchema.find()
      }

      async findCurrent(timestamp: number): Promise<Menu>{

        const menuList = await this.menuSchema.find().select("_id timeslot")

        let sortedMenus: {end: number, start: number, duration: number, id: ObjectId}[] = []
        for (let menu of menuList) {
          for (let timeslot of menu.timeslot) {

            // Handle menus that are active over night => from 2330 to 0300
            if (timeslot.start < 2400 && timeslot.end < timeslot.start){
              timeslot.end += 2400
            }
            sortedMenus.push({
              ...timeslot,
              id: menu._id,
            })
          }
        }

        let id:ObjectId
        for (let menu of sortedMenus) {
          // Check if the delta between current and end is within duration
          if (menu.end - timestamp > 0 && menu.end - timestamp < menu.duration) {
            id = menu.id
            break
          } 
          // Apart from horrible formating this also serves as a check if an over midnight menu is active
          else if (menu.end - (timestamp + 2400) > 0 && menu.end - (timestamp + 2400) < menu.duration){
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
          select: 'name price category allergens labels description _id',
          match: {availability: true}
        })
      }

      async getCurrentTimestamp(): Promise<number> {
        // Get current time in timeslot format. 
        // Max: TODO: implement timezones when restaurant objects are added
        const d = new Date()
        return d.getHours() * 100 + d.getMinutes()

      }
}