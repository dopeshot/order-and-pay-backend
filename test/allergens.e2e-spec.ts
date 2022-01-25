import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { AllergensModule } from '../src/allergens/allergens.module';
import {
    Allergen,
    AllergenDocument
} from '../src/allergens/entities/allergen.entity';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import {
    getAllergenSeeder,
    getExtraAllergenSeeder,
    getSampleAllergen,
    getStringOfLength,
    getWrongId
} from './__mocks__/allergens-mock-data';

describe('AllergensController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let allergenModel: Model<AllergenDocument>;
    const path = '/admin/allergens';

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [rootMongooseTestModule(), AllergensModule]
        }).compile();

        connection = await module.get(getConnectionToken());
        allergenModel = connection.model('Allergen');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await allergenModel.insertMany(getAllergenSeeder());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await allergenModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('admin/allergens (POST)', () => {
        it('should return one element of type Allergen', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send(getSampleAllergen())
                .expect(HttpStatus.CREATED);

            const allergen = new Allergen(res.body);
            expect(res.body).toMatchObject(allergen);

            expect(res.body.title).toBe(getSampleAllergen().title);
            expect(res.body.icon).toBe(getSampleAllergen().icon);
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
                .send({ title: getAllergenSeeder().title })
                .expect(HttpStatus.CONFLICT);
        });
    });

    describe('admin/allergens (GET)', () => {
        it('should return an array with 1 element', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}`)
                .expect(HttpStatus.OK);

            expect(res.body).toHaveLength(1);
            const allergen = new Allergen(res.body[0]);
            expect(res.body[0]).toMatchObject(allergen);
        });
        it('should return an empty array if database is empty', async () => {
            await allergenModel.deleteMany();
            const res = await request(app.getHttpServer())
                .get(`${path}`)
                .expect(HttpStatus.OK);

            expect(res.body).toHaveLength(0);
        });
    });

    describe('admin/allergens/:id (GET)', () => {
        it('should return one element of type Allergen', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}/${getAllergenSeeder()._id}`)
                .expect(HttpStatus.OK);

            const allergen = new Allergen(res.body);
            expect(res.body).toMatchObject(allergen);
        });

        it('should return NOT_FOUND', async () => {
            await request(app.getHttpServer())
                .get(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('admin/allergens/:id/refs (GET): TODO: FIX AFTER DISHES IMPLEMENTED', () => {
        it('should return one element of type Allergen', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}/${getAllergenSeeder()._id}/refs`)
                .expect(HttpStatus.NOT_IMPLEMENTED);

            // const allergen = new Allergen(res.body)
            // expect(res.body).toMatchObject(allergen)
        });

        // it('should return empty array', async () => {
        //     const res = await request(app.getHttpServer())
        //     .get(`${path}/${wrongId()}`)
        //     .expect(HttpStatus.OK)

        //     expect(res.body).toHaveLength(0)
        // })
    });

    describe('admin/allergens/:id (PATCH)', () => {
        it('should return one element of type Allergen with both updates', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getAllergenSeeder()._id}`)
                .send({ title: 'New Title', icon: 'New Icon' })
                .expect(HttpStatus.OK);

            const allergen = new Allergen(res.body);
            expect(res.body).toMatchObject(allergen);
            expect(res.body.title).toBe('New Title');
            expect(res.body.icon).toBe('New Icon');
        });

        it('should return one element of type Allergen with title update', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getAllergenSeeder()._id}`)
                .send({ title: 'New Title' })
                .expect(HttpStatus.OK);

            expect(res.body.title).toBe('New Title');
        });

        it('should return one element of type Allergen with icon update', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getAllergenSeeder()._id}`)
                .send({ icon: 'New Icon' })
                .expect(HttpStatus.OK);

            expect(res.body.icon).toBe('New Icon');
        });

        it('should return OK without data', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getAllergenSeeder()._id}`)
                .expect(HttpStatus.OK);

            // Expect unchanged Object
            expect(res.body.title).toBe(getAllergenSeeder().title);
            expect(res.body.icon).toBe(getAllergenSeeder().icon);
        });

        it('should return OK with wrong param', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getAllergenSeeder()._id}`)
                .send({ wrongparam: 'something' })
                .expect(HttpStatus.OK);

            // Expect unchanged Object
            expect(res.body.title).toBe(getAllergenSeeder().title);
            expect(res.body.icon).toBe(getAllergenSeeder().icon);
        });

        it('should return NOT_FOUND with wrong id', async () => {
            await request(app.getHttpServer())
                .patch(`${path}/${getWrongId()}`)
                .send({ wrongparam: 'something' })
                .expect(HttpStatus.NOT_FOUND);
        });

        it('should return CONFLICT with same title', async () => {
            await allergenModel.insertMany(getExtraAllergenSeeder());
            await request(app.getHttpServer())
                .patch(`${path}/${getExtraAllergenSeeder()._id}`)
                .send({ title: getAllergenSeeder().title })
                .expect(HttpStatus.CONFLICT);
        });
    });

    describe('admin/allergens/:id (DELETE)', () => {
        it('should return NO_CONTENT and delete the allergen', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getAllergenSeeder()._id}`)
                .expect(HttpStatus.NO_CONTENT);

            expect(await allergenModel.find()).toHaveLength(0);
        });

        it('should return', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });
});
