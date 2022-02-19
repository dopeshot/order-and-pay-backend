import {
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
import { Category } from '../categories/entities/category.entity';
import { DishesService } from '../dishes/dishes.service';
import { DishDocument } from '../dishes/entities/dish.entity';
import { OrderEventType } from '../sse/enums/events.enum';
import { SseService } from '../sse/sse.service';
import { Table } from '../tables/entities/table.entity';
import { TablesService } from '../tables/tables.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderDocument } from './entities/order.entity';
import { ChoiceType } from './enums/choice-type.enum';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import {
    readableItem,
    readableOrder
} from './responses/readable-order.response';
@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);
    constructor(
        private readonly sseService: SseService,
        @InjectModel('Order') private readonly orderModel: Model<OrderDocument>,
        private readonly dishesService: DishesService,
        private readonly tablesService: TablesService,
        private readonly categoryService: CategoriesService
    ) {}

    async findAll(): Promise<OrderDocument[]> {
        return await this.orderModel.find().lean();
    }

    async findActive(): Promise<readableOrder[]> {
        const orders = await this.orderModel
            .find({
                Status: {
                    $nin: [OrderStatus.FINISHED, OrderStatus.CANCELLED]
                }
            })
            .lean();
        return await Promise.all(
            orders.map((order) => this.transformToReadable(order._id))
        );
    }

    async transformToReadable(id): Promise<readableOrder> {
        // Get order with table populated
        const orderPopulated = await this.orderModel
            .findById(id)
            .populate('tableId')
            .populate({
                path: 'items.dishId',
                model: 'Dish'
            })
            .lean();

        //console.log(order.items);

        // Seperately populate dish

        // Cache categories to reduce db calls
        const categories: Category[] = [];

        const readableItems: readableItem[] = await Promise.all(
            (
                await orderPopulated
            ).items.map(async (item) => {
                // Check if category has already been used, if so skip unneeded db query
                let itemCategory: Category = categories.find(
                    (cat) =>
                        cat._id.toString() === item.dishId.categoryId.toString()
                );
                if (!itemCategory) {
                    try {
                        // Find unused category and add to categories array
                        itemCategory = await this.categoryService.findOne(
                            item.dishId.categoryId._id
                        );
                        categories.push(itemCategory);
                    } catch (error) {
                        this.logger.error(
                            `A non existant dish was found in order (id = ${orderPopulated._id})`
                        );
                    }
                }

                let pickedChoices = [];

                try {
                    // Populate picked choices
                    pickedChoices = item.pickedChoices.map((choice) =>
                        itemCategory.choices.find((cat) => choice.id === cat.id)
                    );
                } catch (e) {
                    console.log(item.pickedChoices);
                }

                // Insert non populated dish
                return {
                    ...(await orderPopulated.items.find(
                        (i) => item.dishId === i.dishId
                    )),
                    dishId: item.dishId.title,
                    pickedChoices: pickedChoices
                } as readableItem;
            })
        );
        const readable: readableOrder = {
            ...orderPopulated,
            items: readableItems,
            tableId: orderPopulated.tableId.tableNumber
        };

        return readable;
    }

    async create(order: CreateOrderDto): Promise<OrderDocument> {
        // Validate the payment status (This is a mock in the prototype and therefore can not fail)
        /* istanbul ignore next */
        if (!this.validatePayment()) {
            this.logger.warn(`Invalid Payment for order`);
            throw new HttpException(
                'Invalid Payment',
                HttpStatus.PAYMENT_REQUIRED
            );
        }

        let table: Table;
        // Validate the table number and find Id for said table
        try {
            table = await this.tablesService.findOneByTableNumber(
                order.tableNumber
            );
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.warn(
                    `Order for invalid table. This might indicate someone fiddling with the URL`
                );
                throw new UnprocessableEntityException();
            } // This should never happen under normal circumstances
            /* istanbul ignore next */
            this.logger.error(
                `Creating order failed while looking for dishes. (${error})`
            );
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }

        // Calculate price of the dishes and also verify that every dish in order exists
        let baseprice = 0;
        let choicesPrice = 0;

        for (let dishIndex = 0; dishIndex < order.items.length; dishIndex++) {
            const orderItem = order.items[dishIndex];
            // Find dish
            let dish: DishDocument;
            try {
                dish = await (
                    await this.dishesService.findOne(orderItem.dishId as any)
                ).populate('categoryId');
            } catch (error) {
                if (error instanceof NotFoundException) {
                    this.logger.warn(
                        `Order for invalid dish. This might indicate someone fiddling with the order`
                    );
                    throw new UnprocessableEntityException();
                }
                // This should never happen under normal circumstances
                /* istanbul ignore next */
                this.logger.error(
                    `Creating order failed while looking for dishes. (${error})`
                );
                /* istanbul ignore next */
                throw new InternalServerErrorException();
            }

            // Calculate dish price
            baseprice += dish.price * orderItem.count;

            // Go through every choice
            for (
                let choiceIndex = 0;
                choiceIndex < orderItem.pickedChoices.length;
                choiceIndex++
            ) {
                const orderChoice = orderItem.pickedChoices[choiceIndex];
                const selectedChoice = dish.categoryId.choices.find(
                    (choice) => choice.id === orderChoice.id
                );

                if (!selectedChoice) {
                    this.logger.warn(
                        'An invalid choice id was provided. This could incicate someone fiddeling with the request'
                    );
                    throw new UnprocessableEntityException();
                }

                if (
                    selectedChoice.type === ChoiceType.RADIO &&
                    orderChoice.valueId.length !== 1
                ) {
                    this.logger.warn(
                        'An order with an impossible choice has occured. This could incicate someone fiddeling with the request'
                    );
                    throw new UnprocessableEntityException();
                }

                // Choices (checkbox) can have multiple values, so loop over this as well
                for (
                    let optionsIndex = 0;
                    optionsIndex < orderChoice.valueId.length;
                    optionsIndex++
                ) {
                    const orderOption = orderChoice.valueId[optionsIndex];

                    const selectedOption = selectedChoice.options.find(
                        (option) => option.id === orderOption
                    );

                    if (!selectedOption) {
                        this.logger.warn(
                            'An invalid choice id was provided. This could incicate someone fiddeling with the request'
                        );
                        throw new UnprocessableEntityException();
                    }

                    choicesPrice += selectedOption.price * orderItem.count;
                }
            }
        }

        if (order.price !== choicesPrice + baseprice) {
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
            // This should never happen under normal circumstances
            /* istanbul ignore next */
            this.logger.error(`Error occured while creating order(${e})`);
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }

        // This should never happen under normal circumstances
        /* istanbul ignore next */
        if (!receivedOrder) {
            this.logger.error(`An error occured while creating order`);
            throw new InternalServerErrorException();
        }

        // Emit SSE for admin frontend
        this.sseService.emitOrderEvent(
            OrderEventType.new,
            await this.transformToReadable(receivedOrder._id)
        );

        this.logger.debug(
            `The order (id = ${receivedOrder._id}) has been created successfully.`
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
            // This should never happen under normal circumstances
            /* istanbul ignore next */
            this.logger.error(`Error occured while updating order(${e})`);
            /* istanbul ignore next */
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
            this.sseService.emitOrderEvent(
                OrderEventType.close,
                await this.transformToReadable(order._id)
            );
        } else {
            this.sseService.emitOrderEvent(
                OrderEventType.update,
                await this.transformToReadable(order._id)
            );
        }
        this.logger.debug(
            `The order (id = ${order._id}) has been updated successfully.`
        );
        return order;
    }
}
