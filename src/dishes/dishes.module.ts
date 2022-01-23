import { Module } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DishSchema } from './entities/dish.entity';
import { CategorySchema } from '../categories/entities/category.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Dish', schema: DishSchema }])
    ],
    controllers: [DishesController],
    providers: [DishesService],
    exports: []
})
export class DishesModule {}
