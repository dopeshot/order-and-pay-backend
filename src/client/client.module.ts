import { Module } from '@nestjs/common';
import { MenusModule } from 'src/menus/menus.module';
import { OrdersModule } from '../orders/orders.module';
import { ClientController } from './client.controller';

@Module({
    controllers: [ClientController],
    imports: [MenusModule, OrdersModule]
})
export class ClientModule {}
