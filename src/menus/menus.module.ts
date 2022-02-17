import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from '../categories/categories.module';
import { DishesModule } from '../dishes/dishes.module';
import { MenuSchema } from './entities/menu.entity';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Menu', schema: MenuSchema }]),
        CategoriesModule,
        DishesModule
    ],
    providers: [MenusService],
    exports: [MenusService],
    controllers: [MenusController]
})
export class MenusModule {}
