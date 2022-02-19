import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(
    OmitType(CreateOrderDto, ['tableNumber', 'items', 'price'])
) {
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus: PaymentStatus;

    @IsOptional()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
