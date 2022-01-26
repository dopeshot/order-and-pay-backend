import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategorySchema } from './entities/category.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Category', schema: CategorySchema }
        ])
    ],
    providers: [CategoriesService],
    controllers: [CategoriesController],
    exports: [CategoriesService]
})
export class CategoriesModule {}
