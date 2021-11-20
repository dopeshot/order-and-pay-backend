import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DishSchema } from './entities/dish.entity';

@Module({
    imports: [ MongooseModule.forFeature([{ name: 'Dish', schema: DishSchema }]) ],
    controllers: [ DishController],
    providers: [ DishService ],
    exports: [] 
})
export class DishModule {}
