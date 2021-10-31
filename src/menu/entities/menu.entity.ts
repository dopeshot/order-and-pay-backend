import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, ObjectId } from "mongoose"

@Schema({ timestamps: true })
export class Menu {
    _id: ObjectId

    @Prop({ required: true })
    name: string

    @Prop({})
    description: string

    @Prop({ required: true })
    dishes: ObjectId[]

    @Prop( {required: true })
    timeslot: string[]
}

export type MenuDocument = Menu & Document
export const MenuSchema = SchemaFactory.createForClass(Menu)
