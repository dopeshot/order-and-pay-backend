import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { readableOrder } from './responses/readable-order.response';

@ApiTags('orders')
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
        return plainToClass(Order, await this.orderService.findAll());
    }

    @Get('current')
    @ApiOperation({
        summary: 'Get all active orders (received payment and not closed)'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returned currently active orders',
        type: Order
    })
    async getActive() {
        return plainToClass(
            readableOrder,
            await this.orderService.findActive()
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
        return plainToClass(
            Order,
            await this.orderService.update(id, updateData)
        );
    }
}
