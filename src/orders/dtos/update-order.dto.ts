import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Payment } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { CreateOrderDto } from './create-order.dto';

export class PaymentDto extends PartialType(Payment) {}
export class UpdateOrderDto extends PartialType(
    OmitType(CreateOrderDto, ['tableId', 'items'])
) {
    @IsOptional()
    @ValidateNested()
    @Type(() => Payment)
    PaymentStatus: PaymentDto;

    @IsOptional()
    @IsEnum(OrderStatus)
    Status: OrderStatus;
}
