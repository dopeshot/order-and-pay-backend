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
import { plainToClass } from 'class-transformer';
import { Public } from '../auth/strategies/jwt/public.decorator';
import { MenuPopulated } from '../menus/entities/menu.entity';
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
        private readonly menusService: MenusService,
        private readonly orderService: OrdersService
    ) {}

    @Public()
    @Get('menu')
    @ApiOperation({ summary: 'Get currently active menu' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Currently active menu populated',
        type: MenuPopulated
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No current menu found'
    })
    async getMenu() {
        return plainToClass(
            MenuPopulated,
            await this.menusService.findAndPopulate(
                (
                    await this.menusService.findCurrent()
                )._id
            )
        );
    }

    @Public()
    @Post('order')
    @ApiOperation({ summary: 'Create new order' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'New Order has been created',
        type: Order
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Dish was requested that might not be on the menu anymore'
    })
    @ApiResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Order contains invalid data'
    })
    async createOrder(@Body() order: CreateOrderDto) {
        return plainToClass(Order, await this.orderService.create(order));
    }
}
