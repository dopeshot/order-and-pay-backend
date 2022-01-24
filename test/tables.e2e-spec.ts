import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { TableDocument } from '../src/tables/entities/tables.entity';
import { TablesModule } from '../src/tables/tables.module';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import {
    getMockTable,
    getTestSetupData,
    getWrongId
} from './__mocks__/tables-mock-data';

describe('TableController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let tableModel: Model<TableDocument>;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [rootMongooseTestModule(), TablesModule]
        }).compile();

        connection = await module.get(getConnectionToken());
        tableModel = connection.model('Table');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await tableModel.insertMany(getTestSetupData());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await tableModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('Table', () => {
        describe('POST', () => {
            it('tables (POST), create table', async () => {
                const res = await request(app.getHttpServer())
                    .post('/tables')
                    .send(getMockTable())
                    .expect(HttpStatus.CREATED);

                // // Test for class ResponseTable
                // const responseTable = new ResponseTable(res.body);
                // expect(res.body).toMatchObject(responseTable);

                expect(res.body.tableNumber).toEqual(
                    getMockTable().tableNumber
                );
                expect(res.body.capacity).toEqual(getMockTable().capacity);
            });

            it('tables (POST), migrate', async () => {
                await request(app.getHttpServer())
                    .post('/tables/migrate')
                    .expect(HttpStatus.CREATED);
                expect((await tableModel.find()).length).toBe(30);
            });

            // Negative test
            it('tables (POST), duplicate tableNumber', async () => {
                await tableModel.create(getMockTable());
                await request(app.getHttpServer())
                    .post('/tables')
                    .send(getMockTable())
                    .expect(HttpStatus.CONFLICT);
            });
            // Negative test
            it('tables (POST), empty tableNumber', async () => {
                await tableModel.create(getMockTable());
                await request(app.getHttpServer())
                    .post('/tables')
                    .send({ ...getMockTable(), tableNumber: '' })
                    .expect(HttpStatus.BAD_REQUEST);
            });
            // Negative test
            it('tables (POST), too long tableNumber', async () => {
                await tableModel.create(getMockTable());
                await request(app.getHttpServer())
                    .post('/tables')
                    .send({ ...getMockTable(), tableNumber: '123456789' })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            // Negative test
            it('tables (POST), extra properties are ignored', async () => {
                const res = await request(app.getHttpServer())
                    .post('/tables')
                    .send({ ...getMockTable(), chicken: 'CHICKEN' })
                    .expect(HttpStatus.CREATED);
                expect(res.body.chicken).toBeUndefined;
            });

            // Negative test
            it('tables (POST), tableNumber is number', async () => {
                await request(app.getHttpServer())
                    .post('/tables')
                    .send({ ...getMockTable(), tableNumber: 12 })
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });

        describe('GET', () => {
            it('tables (GET), table amounts', async () => {
                const res = await request(app.getHttpServer())
                    .get('/tables')
                    .expect(HttpStatus.OK);

                expect(res.body.length).toBe(10);
            });

            it('tables/:id (GET), correct data received', async () => {
                await tableModel.create(getMockTable());
                const res = await request(app.getHttpServer())
                    .get(`/tables/${getMockTable()._id}`)
                    .expect(HttpStatus.OK);

                // // Test for class ResponseTable
                // const responseTable = new ResponseTable(res.body);
                // expect(res.body).toMatchObject(responseTable);

                expect(res.body).toEqual({
                    ...getMockTable(),
                    updatedAt: res.body.updatedAt
                });
            });

            // Negative test
            it('tables/:id (GET), wrong Id', async () => {
                await request(app.getHttpServer())
                    .get(`/tables/${getWrongId()}`)
                    .expect(HttpStatus.NOT_FOUND);
            });

            // Negative test
            it('tables/:id (GET), wrong Id format', async () => {
                await request(app.getHttpServer())
                    .get('/tables/todtodtodtod')
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });

        describe('PATCH', () => {
            it('tables/:id (PATCH), correct patch', async () => {
                const res = await request(app.getHttpServer())
                    .patch(`/tables/${getTestSetupData()[0]._id}`)
                    .send({ tableNumber: '13', capacity: 3 })
                    .expect(HttpStatus.OK);

                // // Test for class ResponseTable
                // const responseTable = new ResponseTable(res.body);
                // expect(res.body).toMatchObject(responseTable);

                expect(res.body.tableNumber).toEqual('13');
                expect(res.body.capacity).toEqual(3);
            });

            // Negative test
            it('tables (PATCH), patch duplicate tableNumber', async () => {
                await request(app.getHttpServer())
                    .patch(`/tables/${getTestSetupData()[0]._id}`)
                    .send({
                        tableNumber: getTestSetupData()[1].tableNumber,
                        capacity: getTestSetupData()[0].capacity
                    })
                    .expect(HttpStatus.CONFLICT);
            });

            // Negative test
            it('tables/:id (PATCH), wrong Id', async () => {
                await request(app.getHttpServer())
                    .patch(`/tables/${getWrongId()}`)
                    .send({ tableNumber: '13', capacity: 3 })
                    .expect(HttpStatus.NOT_FOUND);
            });

            // Negative test
            it('tables/:id (PATCH): capacity: null', async () => {
                await request(app.getHttpServer())
                    .patch(`/tables/${getMockTable()._id}`)
                    .send({ tableNumber: '13', capacity: null })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            // Negative test
            it('tables/:id (PATCH): capacity: negative', async () => {
                await request(app.getHttpServer())
                    .patch(`/tables/${getMockTable()._id}`)
                    .send({ tableNumber: '13', capacity: -1 })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            // Negative test
            it('tables/:id (PATCH), tablenumber: number', async () => {
                await request(app.getHttpServer())
                    .patch(`/tables/${getMockTable()._id}`)
                    .send({ tableNumber: 13, capacity: 1 })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            // Negative test
            it('tables/:id (PATCH), capacity: missing', async () => {
                await request(app.getHttpServer())
                    .patch(`/tables/${getMockTable()._id}`)
                    .send({ tableNumber: 13 })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            // Negative test
            it('tables/:id (PATCH), wrong property', async () => {
                await request(app.getHttpServer())
                    .patch(`/tables/${getMockTable()._id}`)
                    .send({ tableNumber: 13, capacity: 2, chicken: 13 })
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });

        describe('DELETE', () => {
            it('tables/:id (DELETE), delete table', async () => {
                await request(app.getHttpServer())
                    .delete(`/tables/${getTestSetupData()[0]._id}`)
                    .expect(HttpStatus.NO_CONTENT);
            });

            it('tables/:id (DELETE), bulkDelete tables', async () => {
                await request(app.getHttpServer())
                    .delete('/tables/bulk/delete')
                    .send({
                        ids: getTestSetupData()
                            .splice(1, 3)
                            .map((tables) => tables._id)
                    })
                    .expect(HttpStatus.NO_CONTENT);
                expect((await tableModel.find()).length).toBe(7);
            });

            // Negative test
            it('tables/:id (DELETE), wrong Id', async () => {
                await request(app.getHttpServer())
                    .delete(`/tables/${getWrongId()}`)
                    .expect(HttpStatus.NOT_FOUND);
            });

            // Negative test
            it('tables/:id (DELETE), wrong Id format', async () => {
                await request(app.getHttpServer())
                    .delete(`/tables/aaa`)
                    .expect(HttpStatus.BAD_REQUEST);
            });

            // Negative test
            it('tables/:id (DELETE), bulkDelete tables, notMongoId', async () => {
                await request(app.getHttpServer())
                    .delete('/tables/bulk/delete')
                    .send({ ids: ['aaa', 'aaa'] })
                    .expect(HttpStatus.BAD_REQUEST);
                expect((await tableModel.find()).length).toBe(10);
            });

            // Negative test
            it('tables/:id (DELETE), bulkDelete tables, wrong MongoId', async () => {
                await request(app.getHttpServer())
                    .delete('/tables/bulk/delete')
                    .send({
                        ids: [
                            'aaaaaaaaaaaaaaaaaaaaaa10',
                            'aaaaaaaaaaaaaaaaaaaaaa20'
                        ]
                    })
                    .expect(HttpStatus.NOT_FOUND);
                expect((await tableModel.find()).length).toBe(10);
            });
        });
    });
});
