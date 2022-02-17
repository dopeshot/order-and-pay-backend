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
import { Model, ObjectId } from 'mongoose';
import { OrderEventType } from '../sse/enums/events.enum';
import { SseService } from '../sse/sse.service';
import { TablesService } from '../tables/tables.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderDocument, Payment } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';

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

        if (!this.validatePayment()) {
            this.logger.warn(`Invalid Payment for order`);
            throw new HttpException(
                'Invalid Payment',
                HttpStatus.PAYMENT_REQUIRED
            );
        }

        if (!this.tablesService.findOne(order.tableId)) {
            this.logger.warn(
                `Order for invalid table. This might indicate someone fiddling with the URL`
            );
            throw new BadRequestException();
        }

        // TODO: Validate that all items are actual dishes in db

        const paymentStatus: Payment = {
            status: PaymentStatus.RECEIVED
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
        if (!receivedOrder) {
            this.logger.error(`An error occured while creating order`);
            throw new InternalServerErrorException();
        }
        // Emit SSE for admin frontend
        this.sseService.emitOrderEvent(OrderEventType.new, receivedOrder);

        this.logger.debug(
            `The Category (id = ${receivedOrder._id}) has been created successfully.`
        );

        return receivedOrder;
    }

    validatePayment() {
        this.logger.warn(
            `Payment validation has been called, however this is not implemented correctly yet`
        );
        // TODO: This should communicate with payment api, leave as mock for now
        return true;
    }

    async update(
        id: ObjectId,
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

        if (!order) {
            this.logger.warn(
                `Updating order (id = ${id}) failed as it could not be found.`
            );
            throw new NotFoundException();
        }

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
        this.logger.debug(
            `The order (id = ${order._id}) has been updated successfully.`
        );
        return order;
    }
}
