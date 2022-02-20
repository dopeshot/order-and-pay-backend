import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import {
    Allergen,
    AllergenDocument,
    AllergenSchema
} from '../src/allergens/entities/allergen.entity';
import { DishesModule } from '../src/dishes/dishes.module';
import { Dish, DishDocument } from '../src/dishes/entities/dish.entity';
import {
    Label,
    LabelDocument,
    LabelSchema
} from '../src/labels/entities/label.entity';
import { Status } from '../src/shared/enums/status.enum';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import {
    getAllergensForDishesSeeder,
    getDishSeeder,
    getLabelsForDishesSeeder,
    getSampleDish
} from './__mocks__/dishes-mock-data';
import { getStringOfLength, getWrongId } from './__mocks__/shared-mock-data';

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
                    { name: Allergen.name, schema: AllergenSchema }
                ]),
                MongooseModule.forFeature([
                    { name: Label.name, schema: LabelSchema }
                ])
            ]
        }).compile();

        connection = await module.get(getConnectionToken());
        dishModel = connection.model(Dish.name);
        allergyModel = connection.model(Allergen.name);
        labelModel = connection.model(Label.name);
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await dishModel.insertMany(getDishSeeder());
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
            const dish = plainToClass(Dish, res.body);
            expect(res.body).toMatchObject(dish);

            // Expect default status
            expect(res.body.status).toBe(Status.ACTIVE);
        });

        it('should create a dish without image', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), image: undefined })
                .expect(HttpStatus.CREATED);

            expect(await dishModel.find()).toHaveLength(2);

            const dish = plainToClass(Dish, res.body, {
                exposeUnsetFields: false
            });
            expect(res.body).toMatchObject(dish);
        });

        it('should create a dish without isAvailable', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), isAvailable: undefined })
                .expect(HttpStatus.CREATED);

            expect(await dishModel.find()).toHaveLength(2);
            const dish = plainToClass(Dish, res.body);
            expect(res.body).toMatchObject(dish);
        });

        it('should create a dish with empty allergens', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), allergenIds: [] })
                .expect(HttpStatus.CREATED);

            expect(await dishModel.find()).toHaveLength(2);
            const dish = plainToClass(Dish, res.body);
            expect(res.body).toMatchObject(dish);
        });

        it('should create a dish with empty labels', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), labelIds: [] })
                .expect(HttpStatus.CREATED);

            expect(await dishModel.find()).toHaveLength(2);
            const dish = plainToClass(Dish, res.body);
            expect(res.body).toMatchObject(dish);
        });

        it('should create a dish with image as empty string', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), image: '' })
                .expect(HttpStatus.CREATED);
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
                    .send({ ...getSampleDish(), categoryId: undefined })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with category not a MongoId (number 24 digits)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        categoryId: 111111111111111111111111
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with category not a MongoId (too short)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleDish(), categoryId: 'a' })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with category not a MongoId (too long)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        categoryId: 'aaaaaaaaaaaaaaaaaaaaaaaaa'
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with category not a MongoId (wrong range)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        categoryId: 'AAAAAAAAAAAANMKPLBV789XZ'
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with image too long', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        image: getStringOfLength(101)
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with allergens missing', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        allergenIds: undefined
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with allergens not mongoIdArray (numbers)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        allergenIds: [1, 2]
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with allergens not mongoIdArray (strings)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        allergenIds: ['a', 'b']
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with labels missing', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        labelIds: undefined
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with labels not mongoIdArray (numbers)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        labelIds: [1, 2]
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with labels not mongoIdArray (strings)', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleDish(),
                        labelIds: ['a', 'b']
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });
    });

    describe('admin/dishes (GET)', () => {
        it('should return all categories', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}`)
                .expect(HttpStatus.OK);

            expect(res.body).toHaveLength(1);
        });
    });

    describe('admin/dishes/:id (GET)', () => {
        it('should return one dish', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}/${getDishSeeder()._id}`)
                .expect(HttpStatus.OK);

            const dish = plainToClass(Dish, res.body);
            expect(res.body).toMatchObject(dish);
        });

        it('should return NOT_FOUND with wrong id', async () => {
            await request(app.getHttpServer())
                .get(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('admin/dishes (PATCH)', () => {
        it('should return one element of dish with updated fields', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getDishSeeder()._id}`)
                .send({ title: 'New Title' })
                .expect(HttpStatus.OK);

            const dish = plainToClass(Dish, res.body);
            expect(res.body).toMatchObject(dish);
            expect(res.body.title).toBe('New Title');
        });

        it('should return OK without data', async () => {
            const dish = await dishModel.findById(getDishSeeder()._id).lean();

            const res = await request(app.getHttpServer())
                .patch(`${path}/${getDishSeeder()._id}`)
                .expect(HttpStatus.OK);

            // Expect unchanged Object
            const resDish = plainToClass(Dish, res.body);
            const controllDish = plainToClass(Dish, dish);
            // Either delete __v updatedAt and createdAt or check the rest (chose 2nd)
            expect(resDish.description).toBe(controllDish.description);
            expect(resDish.image).toBe(controllDish.image);
            expect(resDish.categoryId).toBe(controllDish.categoryId);
            expect(resDish.title).toBe(controllDish.title);
            expect(resDish.price).toBe(controllDish.price);
            expect(resDish.allergenIds).toStrictEqual(controllDish.allergenIds);
            expect(resDish.labelIds).toStrictEqual(controllDish.labelIds);
        });

        it('should return OK with image as empty string', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleDish(), image: '' })
                .expect(HttpStatus.CREATED);
            expect(res.body.image).toBe('');
        });

        it('should return NOT_FOUND with wrong id', async () => {
            await request(app.getHttpServer())
                .patch(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('admin/dishes (DELETE)', () => {
        it('should return NO_CONTENT and empty the database with hard delete', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getDishSeeder()._id}?type=hard`)
                .expect(HttpStatus.NO_CONTENT);

            expect(await dishModel.find()).toHaveLength(0);
        });

        it('should return NO_CONTENT and not empty the database with soft delete', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getDishSeeder()._id}?type=soft`)
                .expect(HttpStatus.NO_CONTENT);

            expect(await dishModel.find()).toHaveLength(1);
            expect((await dishModel.findById(getDishSeeder()._id)).status).toBe(
                Status.DELETED
            );
        });

        it('should return NO_CONTENT and not empty the database with no query', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getDishSeeder()._id}`)
                .expect(HttpStatus.NO_CONTENT);

            expect(await dishModel.find()).toHaveLength(1);
            expect((await dishModel.findById(getDishSeeder()._id)).status).toBe(
                Status.DELETED
            );
        });

        it('should return NOT_FOUND and not empty the database with wrong id', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);

            expect(await dishModel.find()).toHaveLength(1);
        });

        it('should return NOT_FOUND and not empty the database with wrong id and type=hard', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getWrongId()}?type=hard`)
                .expect(HttpStatus.NOT_FOUND);

            expect(await dishModel.find()).toHaveLength(1);
        });
    });
});
