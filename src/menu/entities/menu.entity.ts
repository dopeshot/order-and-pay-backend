import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, ObjectId, SchemaTypes } from "mongoose"

@Schema({ timestamps: true })
export class Menu {
    _id: ObjectId

    @Prop({ required: true })
    name: string

    @Prop({})
    description: string

    @Prop({ required: true, type: [{ type: SchemaTypes.ObjectId, ref: 'Dish' }] })
    dishes: ObjectId[]

    @Prop( {required: true })
    timeslot: string[]
}

export type MenuDocument = Menu & Document
export const MenuSchema = SchemaFactory.createForClass(Menu)
