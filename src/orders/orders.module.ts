import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from '../categories/categories.module';
import { DishesModule } from '../dishes/dishes.module';
import { SseModule } from '../sse/sse.module';
import { TablesModule } from '../tables/tables.module';
import { Order, OrderSchema } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
    controllers: [OrdersController],
    providers: [OrdersService],
    imports: [
        SseModule,
        MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
        TablesModule,
        DishesModule,
        CategoriesModule
    ],
    exports: [OrdersService]
})
export class OrdersModule {}
