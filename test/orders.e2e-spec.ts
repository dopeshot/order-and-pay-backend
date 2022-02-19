import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { CategoriesModule } from '../src/categories/categories.module';
import { CategoryDocument } from '../src/categories/entities/category.entity';
import { ClientModule } from '../src/client/client.module';
import { DishesModule } from '../src/dishes/dishes.module';
import { DishDocument } from '../src/dishes/entities/dish.entity';
import { Order, OrderDocument } from '../src/orders/entities/order.entity';
import { OrderStatus } from '../src/orders/enums/order-status.enum';
import { PaymentStatus } from '../src/orders/enums/payment-status.enum';
import { OrdersModule } from '../src/orders/orders.module';
import { OrderEventType } from '../src/sse/enums/events.enum';
import { SseModule } from '../src/sse/sse.module';
import { SseService } from '../src/sse/sse.service';
import { TableDocument } from '../src/tables/entities/table.entity';
import { TablesModule } from '../src/tables/tables.module';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import { SSEHelper } from './helpers/sseWatcher.helper';
import {
    getActiveOrders,
    getCategoryForOrdersSeeder,
    getDishesForOrdersSeeder,
    getOrdersSeeder,
    getProperOrder,
    getUniqueOrder
} from './__mocks__/orders-mock-data';
import { getWrongId } from './__mocks__/shared-mock-data';
import { getTablesSeeder } from './__mocks__/tables-mock-data';

describe('Ordercontroller (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let orderModel: Model<OrderDocument>;
    let tableModel: Model<TableDocument>;
    let dishModel: Model<DishDocument>;
    let categoryModel: Model<CategoryDocument>;
    let sseService: SseService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                OrdersModule,
                SseModule,
                ClientModule,
                TablesModule,
                CategoriesModule,
                DishesModule
            ]
        }).compile();

        connection = await module.get(getConnectionToken());
        orderModel = connection.model('Order');
        tableModel = connection.model('Table');
        dishModel = connection.model('Dish');
        categoryModel = connection.model('Category');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        sseService = module.get<SseService>(SseService);
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await tableModel.insertMany(getTablesSeeder());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await tableModel.deleteMany();
        await orderModel.deleteMany();
        await dishModel.deleteMany();
        await categoryModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('/client/order (POST)', () => {
        it('should create a new order in db (with valid input)', async () => {
            await dishModel.insertMany(getDishesForOrdersSeeder());
            await categoryModel.create(getCategoryForOrdersSeeder());
            const res = await request(app.getHttpServer())
                .post('/client/order')
                .send(getProperOrder())
                .expect(HttpStatus.CREATED);

            expect((await orderModel.find()).length).toBe(1);

            expect(res.body.table).toMatchObject(getTablesSeeder()[0]);

            expect(
                getCategoryForOrdersSeeder().choices.map((o) => o.title)
            ).toContain(res.body.items[0].pickedChoices[0].title);

            expect(
                [].concat(
                    ...getCategoryForOrdersSeeder().choices.map((o) =>
                        o.options.map((i) => i.title)
                    )
                )
            ).toContain(res.body.items[0].pickedChoices[0].optionNames[0]);

            // Check if paid order passes
            expect(res.body.PaymentStatus).toBe(PaymentStatus.RECEIVED);

            // Test response type
            expect(res.body).toMatchObject(
                plainToClass(Order, res.body, { exposeUnsetFields: false })
            );
        });

        it('should send a sse message (with valid input)', async () => {
            await dishModel.insertMany(getDishesForOrdersSeeder());
            await categoryModel.create(getCategoryForOrdersSeeder());
            const eventSource = sseService.subscribe('order');
            const helper = new SSEHelper(eventSource);
            await request(app.getHttpServer())
                .post('/client/order')
                .send(getProperOrder())
                .expect(HttpStatus.CREATED);

            // Check if eventlistener on clientside has been called once
            expect(helper.calls).toBe(1);
            expect(helper.messages[0].data.type).toBe(OrderEventType.new);
        });

        it('should fail with dish pointing to invalid category id', async () => {
            await dishModel.insertMany(getDishesForOrdersSeeder());
            const eventSource = sseService.subscribe('order');
            const helper = new SSEHelper(eventSource);
            await request(app.getHttpServer())
                .post('/client/order')
                .send(getProperOrder())
                .expect(HttpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail with mismatched price', async () => {
            await dishModel.insertMany(getDishesForOrdersSeeder());
            await categoryModel.create(getCategoryForOrdersSeeder());
            await request(app.getHttpServer())
                .post('/client/order')
                .send({ ...getProperOrder(), price: 105 })
                .expect(HttpStatus.NOT_ACCEPTABLE);
        });

        it('should fail with invalid dish id', async () => {
            await dishModel.insertMany(getDishesForOrdersSeeder());
            await categoryModel.create(getCategoryForOrdersSeeder());
            await request(app.getHttpServer())
                .post('/client/order')
                .send({
                    ...getProperOrder(),
                    items: [
                        { ...getProperOrder().items[0], dishId: getWrongId() }
                    ]
                })
                .expect(HttpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail with invalid choices id', async () => {
            await dishModel.insertMany(getDishesForOrdersSeeder());
            await categoryModel.create(getCategoryForOrdersSeeder());
            await request(app.getHttpServer())
                .post('/client/order')
                .send({
                    ...getProperOrder(),
                    items: [
                        {
                            ...getProperOrder().items[0],
                            pickedChoices: [
                                {
                                    ...getProperOrder().items[0]
                                        .pickedChoices[0],
                                    id: 99
                                }
                            ]
                        }
                    ]
                })
                .expect(HttpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail with invalid option id', async () => {
            await dishModel.insertMany(getDishesForOrdersSeeder());
            await categoryModel.create(getCategoryForOrdersSeeder());
            await request(app.getHttpServer())
                .post('/client/order')
                .send({
                    ...getProperOrder(),
                    items: [
                        {
                            ...getProperOrder().items[0],
                            pickedChoices: [
                                {
                                    ...getProperOrder().items[0]
                                        .pickedChoices[0],
                                    valueId: [1, 99]
                                }
                            ]
                        }
                    ]
                })
                .expect(HttpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail with invalid choices amount', async () => {
            await dishModel.insertMany(getDishesForOrdersSeeder());
            await categoryModel.create(getCategoryForOrdersSeeder());
            await request(app.getHttpServer())
                .post('/client/order')
                .send({
                    ...getProperOrder(),
                    items: [
                        {
                            ...getProperOrder().items[1],
                            pickedChoices: [
                                {
                                    ...getProperOrder().items[1]
                                        .pickedChoices[0],
                                    valueId: [1, 2]
                                }
                            ]
                        }
                    ]
                })
                .expect(HttpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail with invalid tableNumber', async () => {
            await tableModel.deleteMany();
            await request(app.getHttpServer())
                .post('/client/order')
                .send(getProperOrder())
                .expect(HttpStatus.UNPROCESSABLE_ENTITY);
        });

        it('should fail with incomplete data', async () => {
            await request(app.getHttpServer())
                .post('/client/order')
                .send({
                    tableId: getTablesSeeder()[0]._id
                })
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    describe('/orders (GET)', () => {
        it('should return all orders', async () => {
            await orderModel.insertMany(getOrdersSeeder());
            const res = await request(app.getHttpServer())
                .get('/orders')
                .expect(HttpStatus.OK);

            expect(res.body.length).toBe(getOrdersSeeder().length);
        });

        it('should return empty array without orders', async () => {
            const res = await request(app.getHttpServer())
                .get('/orders')
                .expect(HttpStatus.OK);

            expect(res.body.length).toBe(0);
        });
    });

    describe('/orders/current (GET)', () => {
        it('should return all active orders', async () => {
            await dishModel.insertMany(getDishesForOrdersSeeder());
            await categoryModel.create(getCategoryForOrdersSeeder());
            await orderModel.insertMany(getOrdersSeeder());
            const res = await request(app.getHttpServer())
                .get('/orders/current')
                .expect(HttpStatus.OK);

            expect(res.body.length).toBe(getActiveOrders().length);
        });

        it('should return empty array without orders', async () => {
            const res = await request(app.getHttpServer())
                .get('/orders/current')
                .expect(HttpStatus.OK);

            expect(res.body.length).toBe(0);
        });

        it('should return empty array without any active orders', async () => {
            // Make all orders inactive
            const orders = getOrdersSeeder().map((order) => ({
                ...order,
                Status: OrderStatus.CANCELLED,
                PaymentStatus: PaymentStatus.CANCELED
            }));
            await orderModel.insertMany(orders);
            const res = await request(app.getHttpServer())
                .get('/orders/current')
                .expect(HttpStatus.OK);
            expect(res.body.length).toBe(0);
        });
    });

    describe('/orders/:id (PATCH)', () => {
        it('should update a given order', async () => {
            const order = getUniqueOrder();
            await orderModel.insertMany(order);
            const res = await request(app.getHttpServer())
                .patch('/orders/' + order._id.toString())
                .send({
                    PaymentStatus: PaymentStatus.RECEIVED,
                    Status: OrderStatus.IN_PROGRESS
                })
                .expect(HttpStatus.OK);

            expect(res.body.Status).toBe(OrderStatus.IN_PROGRESS);
            expect(res.body.PaymentStatus).toBe(PaymentStatus.RECEIVED);
        });

        it('should send an sse event (close)', async () => {
            const sse = sseService.subscribe('order');
            const helper = new SSEHelper(sse);
            // New unseen table that cannot be in any order data
            await orderModel.insertMany(getOrdersSeeder());
            await request(app.getHttpServer())
                .patch('/orders/' + getOrdersSeeder()[0]._id)
                .send({
                    Status: OrderStatus.CANCELLED
                })
                .expect(HttpStatus.OK);
            expect(helper.calls).toBe(1);
            expect(helper.messages[0].data.type).toBe(OrderEventType.close);
        });

        it('should send an sse event (update)', async () => {
            const sse = sseService.subscribe('order');
            const helper = new SSEHelper(sse);
            // New unseen table that cannot be in any order data
            await orderModel.insertMany(getOrdersSeeder());
            await request(app.getHttpServer())
                .patch('/orders/' + getOrdersSeeder()[0]._id)
                .send({
                    note: 'new note'
                })
                .expect(HttpStatus.OK);
            expect(helper.calls).toBe(1);
            expect(helper.messages[0].data.type).toBe(OrderEventType.update);
        });

        it('should fail for invalid id', async () => {
            const sse = sseService.subscribe('order');
            // New unseen table that cannot be in any order data
            await request(app.getHttpServer())
                .patch('/orders/' + getOrdersSeeder()[0]._id)
                .send({
                    Status: OrderStatus.RETURNED
                })
                .expect(HttpStatus.NOT_FOUND);
        });

        it('should fail for invalid Status', async () => {
            // New unseen table that cannot be in any order data
            await request(app.getHttpServer())
                .patch('/orders/' + getOrdersSeeder()[0]._id)
                .send({
                    Status: 'no value'
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should fail for invalid payment status', async () => {
            // New unseen table that cannot be in any order data
            await orderModel.insertMany(getOrdersSeeder());
            await request(app.getHttpServer())
                .patch('/orders/' + getOrdersSeeder()[0]._id)
                .send({
                    PaymentStatus: 'no value'
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should fail with no data', async () => {
            // New unseen table that cannot be in any order data
            await orderModel.insertMany(getOrdersSeeder());
            await request(app.getHttpServer())
                .patch('/orders/' + getOrdersSeeder()[0]._id)
                .send({})
                .expect(HttpStatus.OK);
        });
    });
});
