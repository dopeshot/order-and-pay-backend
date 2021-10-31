import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, ObjectId } from "mongoose"
import { Category } from "../enums/category.enum"

@Schema({ timestamps: true })
export class Dish {
    _id: ObjectId

    @Prop({ required: true })
    name: string

    @Prop({ required: true })
    category: Category

    @Prop({ required: true })
    availability: boolean

    @Prop()
    image: string

    @Prop({ required: true })
    allergens: string[]

    @Prop()
    description : string

    @Prop()
    labels: string[]
}

export type DishDocument = Dish & Document
export const DishSchema = SchemaFactory.createForClass(Dish)
