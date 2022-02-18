import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotAcceptableException,
    NotFoundException,
    UnprocessableEntityException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { DishesService } from '../dishes/dishes.service';
import { OrderEventType } from '../sse/enums/events.enum';
import { SseService } from '../sse/sse.service';
import { TablesService } from '../tables/tables.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderDocument } from './entities/order.entity';
import { ChoiceType } from './enums/choice-type.enum';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);
    constructor(
        private readonly sseService: SseService,
        @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
        private readonly categoryService: CategoriesService,
        private readonly dishesService: DishesService,
        private readonly tablesService: TablesService
    ) {}

    async findAll(): Promise<OrderDocument[]> {
        return await this.orderModel.find().lean();
    }

    async findActive(): Promise<OrderDocument[]> {
        return await this.orderModel
            .find({
                Status: {
                    $nin: [OrderStatus.FINISHED, OrderStatus.CANCELLED]
                }
            })
            .lean();
    }

    async create(order: CreateOrderDto): Promise<OrderDocument> {
        // Validate the payment status (This is a mock in the prototype)
        if (!this.validatePayment()) {
            this.logger.warn(`Invalid Payment for order`);
            throw new HttpException(
                'Invalid Payment',
                HttpStatus.PAYMENT_REQUIRED
            );
        }

        // Validate the table number and find Id for said table
        const table = await this.tablesService.findOneByNumber(
            order.tableNumber
        );

        if (!table) {
            this.logger.warn(
                `Order for invalid table. This might indicate someone fiddling with the URL`
            );
            throw new BadRequestException();
        }

        // Validate dishes and check if received price is correct
        let calculatedPrice = 0;
        console.log(order.items);
        order.items.forEach(async (item) => {
            // go through each dish and check if it exists
            this.dishesService.findOne(item.dish as any).then(async (dish) => {
                // If the dish is not an actual dish, throw an error
                if (!dish) {
                    this.logger.warn(
                        `Order for invalid dish. This might indicate someone fiddling with the order`
                    );
                    throw new UnprocessableEntityException();
                }
                // Find category for that dish
                const category = await this.categoryService.findOne(
                    dish.category._id
                );
                let choicesPrice = 0;

                //Calculate price by going through each dish
                console.log(item.pickedChoices);

                item.pickedChoices.forEach((choice) => {
                    // Find the choice in the category object
                    const categoryChoice = category.choices.find(
                        (c) => c.id === choice.id
                    );

                    // If the choice is not found, throw an error
                    if (!categoryChoice) {
                        this.logger.warn(
                            `Invalid Id for choice provided (id = ${choice.id})`
                        );
                        throw new UnprocessableEntityException();
                    }

                    // add the choices to the price
                    if (choice.type === ChoiceType.RADIO) {
                        const foundChoice = categoryChoice.options.find(
                            (o) => o.id === choice.valueId[0]
                        );
                        if (!foundChoice) {
                            this.logger.warn(
                                `Invalid Id for option provided (id = ${choice.valueId})`
                            );
                            throw new UnprocessableEntityException();
                        }
                        choicesPrice += foundChoice.price;
                    } else {
                        choice.valueId.forEach((valueId) => {
                            const foundChoice = categoryChoice.options.find(
                                (o) => o.id === valueId
                            );
                            if (!foundChoice) {
                                this.logger.warn(
                                    `Invalid Id for option provided (id = ${choice.valueId})`
                                );
                                throw new UnprocessableEntityException();
                            }
                            choicesPrice += foundChoice.price;
                        });
                    }
                    console.log('choicesPrice', choicesPrice);

                    calculatedPrice += (dish.price + choicesPrice) * item.count;
                });
            });
        });

        this.logger.debug('calculatedPrice', calculatedPrice);
        // Price mismatch throws an error
        if (order.price !== calculatedPrice) {
            this.logger.warn(
                `Order price mismatch. This might indicate someone fiddling with the order`
            );
            throw new NotAcceptableException('Order price does not match');
        }

        let receivedOrder: OrderDocument;
        try {
            const newOrder = await this.orderModel.create({
                ...order,
                tableId: table._id,
                PaymentStatus: PaymentStatus.RECEIVED
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
