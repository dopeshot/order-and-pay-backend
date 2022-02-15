import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderEventType } from '../sse/enums/events.enum';
import { SseService } from '../sse/sse.service';
import { TablesService } from '../tables/tables.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderDocument } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { Payment } from './types/payment.type';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);
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
                'PaymentStatus.status': PaymentStatus.RECEIVED
            })
            .lean();
    }

    async create(order: CreateOrderDto): Promise<OrderDocument> {
        // Validate the payment status
        // TODO: Implement this
        const paymentId = order.payment;
        const amount = 10; // This should be calculated
        if (!this.validatePayment(paymentId, amount)) {
            this.logger.warn(`Invalid Payment for order`);
            throw new HttpException(
                'Invalid Payment',
                HttpStatus.PAYMENT_REQUIRED
            );
        }

        if (!this.tablesService.findOne(order.tableId.toString())) {
            this.logger.warn(
                `Order for invalid table. This might indicate someone fiddling with the URL`
            );
            throw new BadRequestException();
        }

        // TODO: Validate that all items are actual dishes in db

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
            this.logger.error(`Error occured while creating order(${e})`);
            throw new InternalServerErrorException();
        }

        // This should never happen
        if (!receivedOrder) throw new InternalServerErrorException();

        // Emit SSE for admin frontend
        this.sseService.emitOrderEvent(OrderEventType.new, receivedOrder);

        return receivedOrder;
    }

    validatePayment(paymentId: string, amount: number) {
        this.logger.warn(
            `Payment validation has been called, however this is not implemented correctly yet`
        );
        //TODO: Implement this
        return true;
    }

    async update(
        id: string,
        updateData: UpdateOrderDto
    ): Promise<OrderDocument> {
        let order: OrderDocument;

        try {
            order = await this.orderModel
                .findByIdAndUpdate(id, updateData, {
                    new: true
                })
                .lean();
        } catch (e) {
            this.logger.error(`Error occured while updating order(${e})`);
            throw new InternalServerErrorException();
        }

        if (!order) throw new NotFoundException();

        // Send SSE event to restaurant
        this.logger.debug(
            `Order ${id} has been updated to ${updateData.Status}`
        );
        if (
            updateData.Status === OrderStatus.FINISHED ||
            updateData.Status === OrderStatus.CANCELLED
        ) {
            this.sseService.emitOrderEvent(OrderEventType.close, order);
        } else {
            this.sseService.emitOrderEvent(OrderEventType.update, order);
        }

        return order;
    }
}
