import { Prop, Schema } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    Length
} from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';

@Schema({ _id: false })
export class Payment {
    @Expose()
    @Prop()
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @Expose()
    @Prop()
    @IsString()
    @Length(10)
    transactionId: string;

    @Expose()
    @Prop()
    @IsEnum(PaymentStatus)
    status: PaymentStatus;
}
