import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, SchemaTypes } from 'mongoose';
import { ChoiceType } from '../../categories/enums/choice-type';

@Schema({ timestamps: true, _id: true })
export class Item {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Dishes', required: true })
    dish: ObjectId;

    @Prop({ required: true })
    count: number;

    @Prop()
    pickedChoices: [{ id: number; type: ChoiceType; valueId: [number] }];

    @Prop()
    note: string;
}

export type ItemDocument = Item & Document;
export const ItemSchema = SchemaFactory.createForClass(Item);
