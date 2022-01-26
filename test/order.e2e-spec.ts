import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { ClientModule } from '../src/client/client.module';
import { Order, OrderDocument } from '../src/orders/entities/order.entity';
import { OrderStatus } from '../src/orders/enums/order-status.enum';
import { PaymentStatus } from '../src/orders/enums/payment-status.enum';
import { OrdersModule } from '../src/orders/orders.module';
import { OrderEventType } from '../src/sse/enums/events.enum';
import { SseModule } from '../src/sse/sse.module';
import { SseService } from '../src/sse/sse.service';
import { TableDocument } from '../src/tables/entities/tables.entity';
import { TablesModule } from '../src/tables/tables.module';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import { SSEHelper } from './helpers/sseWatcher.helper';
import {
    getActiveOrders,
    getTestOrderData,
    getUniqueOrder
} from './__mocks__/orders-mock-data';
import { getTestTableData } from './__mocks__/tables-mock-data';

describe('Ordercontroller (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let orderModel: Model<OrderDocument>;
    let tableModel: Model<TableDocument>;
    let sseService: SseService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                OrdersModule,
                SseModule,
                ClientModule,
                TablesModule
            ]
        }).compile();

        connection = await module.get(getConnectionToken());
        orderModel = connection.model('Order');
        tableModel = connection.model('Table');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        sseService = module.get<SseService>(SseService);
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await tableModel.insertMany(getTestTableData());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await tableModel.deleteMany();
        await orderModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('/client/order (POST)', () => {
        it('should create a new order in db (with valid input)', async () => {
            const res = await request(app.getHttpServer())
                .post('/client/order')
                .send({
                    tableId: getTestTableData()[0]._id,
                    items: [],
                    payment: 'my transaction id'
                })
                .expect(HttpStatus.CREATED);

            expect((await orderModel.find()).length).toBe(1);

            // Check if paid order passes
            expect(res.body.PaymentStatus.status).toBe(PaymentStatus.RECEIVED);

            // Test response type
            expect(res.body).toMatchObject(new Order(res.body));
        });

        it('should send a sse message (with valid input)', async () => {
            const eventSource = sseService.subscribe('order');
            const helper = new SSEHelper(eventSource);
            await request(app.getHttpServer())
                .post('/client/order')
                .send({
                    tableId: getTestTableData()[0]._id,
                    items: [],
                    payment: 'my transaction id'
                })
                .expect(HttpStatus.CREATED);

            // Check if eventlistener on clientside has been called once
            expect(helper.calls).toBe(1);
            expect(helper.messages[0].data.type).toBe(OrderEventType.new);
        });

        it('should fail with invalid tableid', async () => {
            await request(app.getHttpServer())
                .post('/client/order')
                .send({
                    tableId: 'yyxyxyxyyxxyxxyyxyxxyyxx',
                    items: [],
                    payment: 'my transaction id'
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should fail with incomplete data', async () => {
            await request(app.getHttpServer())
                .post('/client/order')
                .send({
                    tableId: getTestTableData()[0]._id
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        // TODO: Should fail with invalid dishes and no dishes
        // should also fail with invalid transactionId
    });

    describe('/orders (GET)', () => {
        it('should return all orders', async () => {
            await orderModel.insertMany(getTestOrderData());
            let res = await request(app.getHttpServer())
                .get('/orders')
                .expect(HttpStatus.OK);

            expect(res.body.length).toBe(getTestOrderData().length);
        });

        it('should return empty array without orders', async () => {
            let res = await request(app.getHttpServer())
                .get('/orders')
                .expect(HttpStatus.OK);

            expect(res.body.length).toBe(0);
        });
    });

    describe('/orders/current (GET)', () => {
        it('should return all active orders', async () => {
            await orderModel.insertMany(getTestOrderData());
            let res = await request(app.getHttpServer())
                .get('/orders/current')
                .expect(HttpStatus.OK);

            expect(res.body.length).toBe(getActiveOrders().length);
        });

        it('should return empty array without orders', async () => {
            let res = await request(app.getHttpServer())
                .get('/orders/current')
                .expect(HttpStatus.OK);

            expect(res.body.length).toBe(0);
        });

        it('should return empty array without any active orders', async () => {
            // Make all orders inactive
            const orders = getTestOrderData().map((order) => {
                return {
                    ...order,
                    Status: OrderStatus.CANCELLED,
                    PaymentStatus: {
                        ...order.PaymentStatus,
                        status: PaymentStatus.CANCELED
                    }
                };
            });
            await orderModel.insertMany(orders);
            let res = await request(app.getHttpServer())
                .get('/orders/current')
                .expect(HttpStatus.OK);
            expect(res.body.length).toBe(0);
        });
    });

    describe('/orders/:id (PATCH)', () => {
        it('should update a given order', async () => {
            //New unseen table that cannot be in any order data
            await tableModel.insertMany({
                _id: 'aaaaaaaaaaaaaaaaaaaaaa69',
                tableNumber: 'C9',
                capacity: 1,
                author: 'Me0'
            });
            const order = getUniqueOrder();
            await orderModel.insertMany(order);
            let res = await request(app.getHttpServer())
                .patch('/orders/' + order._id.toString())
                .send({
                    PaymentStatus: {
                        status: PaymentStatus.RECEIVED,
                        transactionId: 'aaaaaaaaaa',
                        amount: 2
                    },
                    Status: OrderStatus.IN_PROGRESS
                })
                .expect(HttpStatus.OK);

            expect(res.body.Status).toBe(OrderStatus.IN_PROGRESS);
            expect(res.body.PaymentStatus).toMatchObject({
                status: PaymentStatus.RECEIVED,
                transactionId: 'aaaaaaaaaa',
                amount: 2
            });
        });

        it('should send an sse event (close)', async () => {
            const sse = sseService.subscribe('order');
            const helper = new SSEHelper(sse);
            // New unseen table that cannot be in any order data
            await orderModel.insertMany(getTestOrderData());
            await request(app.getHttpServer())
                .patch('/orders/' + getTestOrderData()[0]._id)
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
            await orderModel.insertMany(getTestOrderData());
            await request(app.getHttpServer())
                .patch('/orders/' + getTestOrderData()[0]._id)
                .send({
                    note: 'new note'
                })
                .expect(HttpStatus.OK);
            expect(helper.calls).toBe(1);
            expect(helper.messages[0].data.type).toBe(OrderEventType.update);
        });

        it('should fail for invalid id', async () => {
            const sse = sseService.subscribe('order');
            const helper = new SSEHelper(sse);
            // New unseen table that cannot be in any order data
            await request(app.getHttpServer())
                .patch('/orders/' + getTestOrderData()[0]._id)
                .send({
                    Status: OrderStatus.RETURNED
                })
                .expect(HttpStatus.NOT_FOUND);
        });

        it('should fail for invalid status', async () => {
            // New unseen table that cannot be in any order data
            await orderModel.insertMany(getTestOrderData());
            await request(app.getHttpServer())
                .patch('/orders/' + getTestOrderData()[0]._id)
                .send({
                    Status: 'unknown'
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should fail for invalid data', async () => {
            // New unseen table that cannot be in any order data
            await orderModel.insertMany(getTestOrderData());
            await request(app.getHttpServer())
                .patch('/orders/' + getTestOrderData()[0]._id)
                .send({
                    data: 'what even is this?'
                })
                .expect(HttpStatus.OK);
        });
    });
});