import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpStatus,
    Post,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenusService } from '../menus/menus.service';
import { PopulatedMenuResponse } from '../menus/responses/populated-menu.response';
import { CreateOrderDto } from '../orders/dtos/create-order.dto';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';

@Controller('client')
@ApiTags('client')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class ClientController {
    constructor(
        private readonly menusService: MenusService,
        private readonly orderService: OrdersService
    ) {}

    @Get('menu')
    @ApiOperation({ summary: 'Get currently active menu' })
    async getMenu() {
        return new PopulatedMenuResponse(
            await this.menusService.findAndPopulate(
                (
                    await this.menusService.findCurrent()
                )._id
            )
        );
    }

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
    async createOrder(@Body() order: CreateOrderDto) {
        return new Order(await this.orderService.create(order));
    }
}
