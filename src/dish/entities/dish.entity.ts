import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, ObjectId, SchemaTypes } from "mongoose"

@Schema({ timestamps: true })
export class Dish {
    _id: ObjectId

    @Prop({ required: true })
    name: string

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Category', required: true })
    category: ObjectId

    @Prop({ required: true, default: true })
    availability: boolean

    @Prop()
    image: string

    @Prop({ required: true })
    allergens: string[]

    @Prop()
    description : string

    @Prop()
    labels: string[]

    @Prop({ required: true })
    price: number
}

export type DishDocument = Dish & Document
export const DishSchema = SchemaFactory.createForClass(Dish)
