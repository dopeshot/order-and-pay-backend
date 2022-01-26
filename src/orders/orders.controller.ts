import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly orderService: OrdersService) {}

    @Get()
    @ApiOperation({ summary: 'Get all orders' })
    async getAll() {
        return (await this.orderService.findAll()).map(
            (order) => new Order(order)
        );
    }

    @Get('current')
    @ApiOperation({
        summary: 'Get all active orders (received payment and note closed)'
    })
    async getActive() {
        return (await this.orderService.findActive()).map(
            (order) => new Order(order)
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Patch order by id' })
    async updateOrder(
        @Body() updateData: UpdateOrderDto,
        @Param() @Param() { id }: MongoIdDto
    ) {
        return new Order(await this.orderService.update(id, updateData));
    }
}
