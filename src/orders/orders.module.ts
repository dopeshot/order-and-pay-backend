import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SseModule } from '../sse/sse.module';
import { TablesModule } from '../tables/tables.module';
import { OrderSchema } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
    controllers: [OrdersController],
    providers: [OrdersService],
    imports: [
        SseModule,
        MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
        TablesModule
    ],
    exports: [OrdersService]
})
export class OrdersModule {}
