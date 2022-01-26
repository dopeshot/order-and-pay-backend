import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { Payment } from '../types/payment.type';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(
    OmitType(CreateOrderDto, ['tableId'])
) {
    @IsOptional()
    @Type(() => Payment)
    PaymentStatus: Payment;

    @IsOptional()
    @IsEnum(OrderStatus)
    Status: OrderStatus;
}
