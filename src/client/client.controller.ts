import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    HttpStatus,
    Post,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenusService } from '../menus/menus.service';
import { CreateOrderDto } from '../orders/dtos/create-order.dto';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';

@Controller('client')
@ApiTags('client')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class ClientController {
    constructor(
        private readonly menuService: MenusService,
        private readonly orderService: OrdersService
    ) {}

    @Post('order')
    @ApiOperation({ summary: 'Create new order' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'New Order has been created',
        type: Order
    })
    @ApiResponse({
        status: HttpStatus.PAYMENT_REQUIRED,
        description: 'Failed to create order due to payment issues ',
        type: Order
    })
    async create(@Body() order: CreateOrderDto) {
        const x = new Order(await this.orderService.create(order));
        return x;
    }
}
