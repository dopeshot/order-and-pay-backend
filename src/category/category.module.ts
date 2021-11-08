import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './entities/category.entity';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }])],
    providers: [CategoryService],
    controllers: [CategoryController],
})
export class CategoryModule {}
