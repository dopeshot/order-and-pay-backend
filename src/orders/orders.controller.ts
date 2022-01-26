import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly orderService: OrdersService) {}

    @Get()
    @ApiOperation({ summary: 'Get all orders' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returned all orders',
        type: Order
    })
    async getAll() {
        return (await this.orderService.findAll()).map(
            (order) => new Order(order)
        );
    }

    @Get('current')
    @ApiOperation({
        summary: 'Get all active orders (received payment and note closed)'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returned currently active orders',
        type: Order
    })
    async getActive() {
        return (await this.orderService.findActive()).map(
            (order) => new Order(order)
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Patch order by id' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Updated order by id',
        type: Order
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No order with this id exists',
        type: Order
    })
    async updateOrder(
        @Body() updateData: UpdateOrderDto,
        @Param() @Param() { id }: MongoIdDto
    ) {
        return new Order(await this.orderService.update(id, updateData));
    }
}