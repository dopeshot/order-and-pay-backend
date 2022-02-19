import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DishesModule } from '../dishes/dishes.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategorySchema } from './entities/category.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Category', schema: CategorySchema }
        ]),
        DishesModule
    ],
    providers: [CategoriesService],
    controllers: [CategoriesController],
    exports: [CategoriesService]
})
export class CategoriesModule {}
