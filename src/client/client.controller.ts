import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Post,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
    async create(@Body() order: CreateOrderDto) {
        const x = new Order(await this.orderService.create(order));
        return x;
    }
}
