import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import {
    AllergenDocument,
    AllergenSchema
} from '../src/allergens/entities/allergen.entity';
import { DishesModule } from '../src/dishes/dishes.module';
import { Dish, DishDocument } from '../src/dishes/entities/dish.entity';
import {
    LabelDocument,
    LabelSchema
} from '../src/labels/entities/label.entity';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import {
    getAllergensForDishesSeeder,
    getDishesSeeder,
    getLabelsForDishesSeeder,
    getSampleDish
} from './__mocks__/dishes-mock-data';
import { getStringOfLength } from './__mocks__/shared-mock-data';

describe('DishController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let dishModel: Model<DishDocument>;
    let allergyModel: Model<AllergenDocument>;
    let labelModel: Model<LabelDocument>;
    const path = '/dishes';

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                DishesModule,
                MongooseModule.forFeature([
                    { name: 'Allergen', schema: AllergenSchema }
                ]),
                MongooseModule.forFeature([
                    { name: 'Label', schema: LabelSchema }
                ])
            ]
        }).compile();

        connection = await module.get(getConnectionToken());
        dishModel = connection.model('Dish');
        allergyModel = connection.model('Allergen');
        labelModel = connection.model('Label');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await dishModel.insertMany(getDishesSeeder());
        await allergyModel.insertMany(getAllergensForDishesSeeder());
        await labelModel.insertMany(getLabelsForDishesSeeder());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await dishModel.deleteMany();
        await allergyModel.deleteMany();
        await labelModel.deleteMany();
    });

    afterAll(async () => {
        await app.close();
        closeInMongodConnection();
    });

    describe('admin/dishes (POST)', () => {
        it('should create a dish', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send(getSampleDish())
                .expect(HttpStatus.CREATED);

            expect(await dishModel.find()).toHaveLength(2);
            const dish = new Dish(res.body);
            expect(res.body).toMatchObject(dish);
        });

        it('should create a dish without image', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), image: undefined })
                .expect(HttpStatus.CREATED);

            expect(await dishModel.find()).toHaveLength(2);
            const dish = new Dish(res.body);
            expect(res.body).toMatchObject(dish);
        });

        it('should create a dish without isAvailable', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), isAvailable: undefined })
                .expect(HttpStatus.CREATED);

            expect(await dishModel.find()).toHaveLength(2);
            const dish = new Dish(res.body);
            expect(res.body).toMatchObject(dish);
        });

        it('should create a dish with empty allergens', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), allergens: [] })
                .expect(HttpStatus.CREATED);

            expect(await dishModel.find()).toHaveLength(2);
            const dish = new Dish(res.body);
            expect(res.body).toMatchObject(dish);
        });

        it('should create a dish with empty labels', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), labels: [] })
                .expect(HttpStatus.CREATED);

            expect(await dishModel.find()).toHaveLength(2);
            const dish = new Dish(res.body);
            expect(res.body).toMatchObject(dish);
        });

        describe('dto tests for dish', () => {
            it('should return BAD_REQUEST with no data in body ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with title missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleDish(), title: undefined })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with title too short ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleDish(), title: getStringOfLength(1) })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with title too long ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleDish(), title: getStringOfLength(201) })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with price missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleDish(), price: undefined })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with price no number ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleDish(), price: 'a' })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with price below 0 ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleDish(), price: -1 })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with category missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleDish(), category: undefined })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with category not a MongoId (number 24 digits)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        category: 111111111111111111111111
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with category not a MongoId (too short)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleDish(), category: 'a' })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with category not a MongoId (too long)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        category: 'aaaaaaaaaaaaaaaaaaaaaaaaa'
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with category not a MongoId (wrong range)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        category: 'AAAAAAAAAAAANMKPLBV789XZ'
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with allergens missing', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        allergens: undefined
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with allergens not mongoIdArray (numbers)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        allergens: [1, 2]
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with allergens not mongoIdArray (strings)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        allergens: ['a', 'b']
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with labels missing', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        labels: undefined
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with labels not mongoIdArray (numbers)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        labels: [1, 2]
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with labels not mongoIdArray (strings)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        labels: ['a', 'b']
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });
    });
    describe('admin/dishes (GET)', () => {});
    describe('admin/dishes/:id (GET)', () => {});
    describe('admin/dishes (PATCH)', () => {});
    describe('admin/dishes (DELETE)', () => {});
});
