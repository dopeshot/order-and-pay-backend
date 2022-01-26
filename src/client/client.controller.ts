import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenusService } from '../menus/menus.service';
import { createOrderDto } from '../orders/dtos/create-order.dto';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';

@Controller('client')
@ApiTags('client')
export class ClientController {
    constructor(
        private readonly menuService: MenusService,
        private readonly orderService: OrdersService
    ) {}

    @Post('order')
    @ApiOperation({ summary: 'Create new order' })
    async create(@Body() order: createOrderDto) {
        return new Order(await this.orderService.create(order));
    }
}
