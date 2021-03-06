import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { Dish, DishDocument } from '../src/dishes/entities/dish.entity';
import { Label, LabelDocument } from '../src/labels/entities/label.entity';
import { LabelsModule } from '../src/labels/labels.module';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import {
    getDishWithReference,
    getExtraLabelSeeder,
    getLabelSeeder,
    getSampleLabel
} from './__mocks__/labels-mock-data';
import { getStringOfLength, getWrongId } from './__mocks__/shared-mock-data';

describe('LabelsController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let labelModel: Model<LabelDocument>;
    let dishModel: Model<DishDocument>;
    const path = '/labels';

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [rootMongooseTestModule(), LabelsModule]
        }).compile();

        connection = await module.get(getConnectionToken());
        labelModel = connection.model(Label.name);
        dishModel = connection.model(Dish.name);
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await labelModel.insertMany(getLabelSeeder());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await labelModel.deleteMany();
        await dishModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('admin/labels (POST)', () => {
        it('should return one element of type Label', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send(getSampleLabel())
                .expect(HttpStatus.CREATED);

            const label = plainToClass(Label, res.body);
            expect(res.body).toMatchObject(label);

            expect(res.body.title).toBe(getSampleLabel().title);
            expect(res.body.icon).toBe(getSampleLabel().icon);
        });

        it('should return CREATED with only title', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send({ title: 'aaaaaaaa' })
                .expect(HttpStatus.CREATED);
        });

        it('should return BAD_REQUEST without title', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send({ icon: 'aaaaaaaa' })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return BAD_REQUEST with too short title', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send({ title: '' })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return BAD_REQUEST with too long title', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send({ title: getStringOfLength(21) })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return BAD_REQUEST with too short icon', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send({ title: 'normal', icon: '' })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return BAD_REQUEST with too long icon', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send({ title: 'normal', icon: getStringOfLength(51) })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return BAD_REQUEST with wrong dto', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send({ wrongparam: 'aaaaaaaa' })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return BAD_REQUEST without data', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .expect(HttpStatus.BAD_REQUEST);
        });

        it('should return CONFLICT with duplicate title', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send({ title: getLabelSeeder().title })
                .expect(HttpStatus.CONFLICT);
        });
    });

    describe('admin/labels (GET)', () => {
        it('should return an array with 1 element', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}`)
                .expect(HttpStatus.OK);

            expect(res.body).toHaveLength(1);
            const label = plainToClass(Label, res.body[0]);
            expect(res.body[0]).toMatchObject(label);
        });
        it('should return an empty array if database is empty', async () => {
            await labelModel.deleteMany();
            const res = await request(app.getHttpServer())
                .get(`${path}`)
                .expect(HttpStatus.OK);

            expect(res.body).toHaveLength(0);
        });
    });

    describe('admin/labels/:id (GET)', () => {
        it('should return one element of type Label', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}/${getLabelSeeder()._id}`)
                .expect(HttpStatus.OK);

            const label = plainToClass(Label, res.body);
            expect(res.body).toMatchObject(label);
        });

        it('should return NOT_FOUND', async () => {
            await request(app.getHttpServer())
                .get(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('admin/labels/:id/refs (GET)', () => {
        it('should return array of dishes', async () => {
            await dishModel.insertMany(getDishWithReference());

            const res = await request(app.getHttpServer())
                .get(`${path}/${getLabelSeeder()._id}/refs`)
                .expect(HttpStatus.OK);

            const dish = plainToClass(Dish, res.body[0]);

            expect(res.body[0]).toMatchObject(dish);

            expect(res.body).toHaveLength(1);
        });

        it('should return empty array', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}/${getWrongId()}/refs`)
                .expect(HttpStatus.OK);

            expect(res.body).toHaveLength(0);
        });
    });

    describe('admin/labels/:id (PATCH)', () => {
        it('should return one element of type Label with both updates', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelSeeder()._id}`)
                .send({ title: 'New Title', icon: 'New Icon' })
                .expect(HttpStatus.OK);

            const label = plainToClass(Label, res.body);
            expect(res.body).toMatchObject(label);
            expect(res.body.title).toBe('New Title');
            expect(res.body.icon).toBe('New Icon');
        });

        it('should return one element of type Label with title update', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelSeeder()._id}`)
                .send({ title: 'New Title' })
                .expect(HttpStatus.OK);

            expect(res.body.title).toBe('New Title');
        });

        it('should return one element of type Label with icon update', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelSeeder()._id}`)
                .send({ icon: 'New Icon' })
                .expect(HttpStatus.OK);

            expect(res.body.icon).toBe('New Icon');
        });

        it('should return OK without data', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelSeeder()._id}`)
                .expect(HttpStatus.OK);

            // Expect unchanged Object
            expect(res.body.title).toBe(getLabelSeeder().title);
            expect(res.body.icon).toBe(getLabelSeeder().icon);
        });

        it('should return OK with wrong param', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelSeeder()._id}`)
                .send({ wrongparam: 'something' })
                .expect(HttpStatus.OK);

            // Expect unchanged Object
            expect(res.body.title).toBe(getLabelSeeder().title);
            expect(res.body.icon).toBe(getLabelSeeder().icon);
        });

        it('should return NOT_FOUND with wrong id', async () => {
            await request(app.getHttpServer())
                .patch(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });

        it('should return CONFLICT with same title', async () => {
            await labelModel.insertMany(getExtraLabelSeeder());
            await request(app.getHttpServer())
                .patch(`${path}/${getExtraLabelSeeder()._id}`)
                .send({ title: getLabelSeeder().title })
                .expect(HttpStatus.CONFLICT);
        });
    });

    describe('admin/labels/:id (DELETE)', () => {
        it('should return NO_CONTENT and delete the label', async () => {
            await dishModel.insertMany(getDishWithReference());

            await request(app.getHttpServer())
                .delete(`${path}/${getLabelSeeder()._id}`)
                .expect(HttpStatus.NO_CONTENT);

            expect(await labelModel.find()).toHaveLength(0);

            expect(
                (await dishModel.findById(getDishWithReference()._id)).labelIds
            ).toHaveLength(1);
        });

        it('should return', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });
});
