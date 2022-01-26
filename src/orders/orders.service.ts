import {
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderEventType } from '../sse/enums/events.enum';
import { SseService } from '../sse/sse.service';
import { TablesService } from '../tables/tables.service';
import { createOrderDto } from './dtos/create-order.dto';
import { updateOrderDto } from './dtos/update-order.dto';
import { Order, OrderDocument } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { Payment } from './types/payment.type';

@Injectable()
export class OrdersService {
    constructor(
        private readonly sseService: SseService,
        @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
        private readonly tablesService: TablesService
    ) {}

    async findAll(): Promise<OrderDocument[]> {
        return await this.orderModel.find().lean();
    }

    async findActive(): Promise<OrderDocument[]> {
        return await this.orderModel
            .find({
                Status: { $nin: [OrderStatus.CANCELLED, OrderStatus.FINISHED] },
                'PaymentStatus.status': { $in: [PaymentStatus.RECEIVED] }
            })
            .lean();
    }

    async create(order: createOrderDto): Promise<OrderDocument> {
        // Validate the payment status
        // TODO: Implement this
        const paymentId = order.payment;
        const amount = 10; // This should be calculated
        if (!this.validatePayment(paymentId, amount)) {
            throw new HttpException(
                'Invalid Payment',
                HttpStatus.PAYMENT_REQUIRED
            );
        }

        //if (!this.tablesService.findOne(order.tableId)){ throw new BadRequestException()}

        const paymentStatus: Payment = {
            status: PaymentStatus.RECEIVED,
            transactionId: paymentId,
            amount: amount
        };
        let receivedOrder: OrderDocument;
        try {
            const newOrder = await this.orderModel.create({
                ...order,
                PaymentStatus: paymentStatus
            });

            receivedOrder = newOrder.toObject() as OrderDocument;
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }

        // This should never happen
        if (!receivedOrder) throw new InternalServerErrorException();

        // Emit SSE for admin frontend
        this.sseService.emitOrderEvent(
            OrderEventType.new,
            new Order(receivedOrder)
        );

        return receivedOrder;
    }

    validatePayment(paymentId: string, amount: number) {
        //TODO: Implement this
        return true;
    }

    async update(
        id: string,
        updateData: updateOrderDto
    ): Promise<OrderDocument> {
        let order: OrderDocument;
        try {
            order = await this.orderModel.findByIdAndUpdate(id, updateData, {
                new: true
            });
        } catch (e) {
            throw new InternalServerErrorException();
        }

        if (!order) throw new NotFoundException();
        return order;
    }
}
