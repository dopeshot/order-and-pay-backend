import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { CategoriesModule } from '../src/categories/categories.module';
import {
    Category,
    CategoryDocument
} from '../src/categories/entities/category.entity';
import { DishesModule } from '../src/dishes/dishes.module';
import { Dish, DishDocument } from '../src/dishes/entities/dish.entity';
import { Status } from '../src/menus/enums/status.enum';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import {
    getCategorySeeder,
    getDishForCategorySeeder,
    getSampleCategory
} from './__mocks__/categories-mock-data';
import { getStringOfLength, getWrongId } from './__mocks__/shared-mock-data';

describe('CategoriesController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let categoryModel: Model<CategoryDocument>;
    let dishModel: Model<DishDocument>;
    const path = '/categories';

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [rootMongooseTestModule(), CategoriesModule, DishesModule]
        }).compile();

        connection = await module.get(getConnectionToken());
        categoryModel = connection.model('Category');
        dishModel = connection.model('Dish');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await categoryModel.insertMany(getCategorySeeder());
        await dishModel.insertMany(getDishForCategorySeeder());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await categoryModel.deleteMany();
        await dishModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
        await app.close();
    });

    describe('admin/categories (POST)', () => {
        it('should create a category', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send(getSampleCategory())
                .expect(HttpStatus.CREATED);

            expect(await categoryModel.find()).toHaveLength(2);
            const category = plainToClass(Category, res.body, {
                exposeUnsetFields: false
            });
            expect(res.body).toMatchObject(category);

            // Expect default status
            expect(res.body.status).toBe(Status.ACTIVE);
        });

        it('should create a category without icon', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleCategory(), icon: undefined })
                .expect(HttpStatus.CREATED);

            expect(await categoryModel.find()).toHaveLength(2);
            const category = plainToClass(Category, res.body, {
                exposeUnsetFields: false
            });
            expect(res.body).toMatchObject(category);
        });

        it('should create a category without image', async () => {
            const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send({ ...getSampleCategory(), image: undefined })
                .expect(HttpStatus.CREATED);

            expect(await categoryModel.find()).toHaveLength(2);
            const category = plainToClass(Category, res.body, {
                exposeUnsetFields: false
            });
            expect(res.body).toMatchObject(category);
        });

        it('should return CONFLICT with duplicate title', async () => {
            await request(app.getHttpServer())
                .post(`${path}`)
                .send(getCategorySeeder())
                .expect(HttpStatus.CONFLICT);
        });

        describe('dto tests for category', () => {
            it('should return BAD_REQUEST with no data in body ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with title missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleCategory(), title: undefined })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with title too short ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        title: getStringOfLength(1)
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with title too long ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        title: getStringOfLength(31)
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with description missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleCategory(), description: undefined })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with description too short ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        description: getStringOfLength(1)
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with description too long ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        description: getStringOfLength(201)
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with icon too short ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        icon: getStringOfLength(1)
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with icon too long ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        icon: getStringOfLength(101)
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with image too short ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        image: getStringOfLength(1)
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with image too long ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        image: getStringOfLength(101)
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with menu missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleCategory(), menu: undefined })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with choices missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleCategory(), choices: undefined })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return CREATED with choices being empty ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({ ...getSampleCategory(), choices: [] })
                    .expect(HttpStatus.CREATED);
            });
        });

        describe('dto tests for category.choices type', () => {
            it('should return BAD_REQUEST with choices.id missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        choices: {
                            ...getSampleCategory().choices,
                            id: undefined
                        }
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with choices.title missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        choices: {
                            ...getSampleCategory().choices,
                            title: undefined
                        }
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with choices.type missing ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        choices: {
                            ...getSampleCategory().choices,
                            type: undefined
                        }
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with choices.type wrong enum ', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        choices: {
                            ...getSampleCategory().choices,
                            type: 'asd'
                        }
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with choices.options missing', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        choices: {
                            ...getSampleCategory().choices,
                            options: undefined
                        }
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });

        describe('dto tests for category.choices.options', () => {
            it('should return BAD_REQUEST with choices.options.id missing', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        choices: {
                            ...getSampleCategory().choices,
                            options: {
                                ...getSampleCategory().choices[0].options,
                                id: undefined
                            }
                        }
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with choices.options.name missing', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        choices: {
                            ...getSampleCategory().choices,
                            options: {
                                ...getSampleCategory().choices[0].options,
                                name: undefined
                            }
                        }
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return BAD_REQUEST with choices.options.price missing', async () => {
                await request(app.getHttpServer())
                    .post(`${path}`)
                    .send({
                        ...getSampleCategory(),
                        choices: {
                            ...getSampleCategory().choices,
                            options: {
                                ...getSampleCategory().choices[0].options,
                                price: undefined
                            }
                        }
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });
        });
    });

    describe('admin/categories (GET)', () => {
        it('should return all categories', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}`)
                .expect(HttpStatus.OK);

            expect(res.body).toHaveLength(1);
        });
    });

    describe('admin/categories/:id (GET)', () => {
        it('should return one category', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}/${getCategorySeeder()._id}`)
                .expect(HttpStatus.OK);

            const category = plainToClass(Category, res.body, {
                exposeUnsetFields: false
            });
            expect(res.body).toMatchObject(category);
        });

        it('should return NOT_FOUND with wrong id', async () => {
            await request(app.getHttpServer())
                .get(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('admin/categories/:id/refs (GET)', () => {
        it('should return one element of type Label', async () => {
            const res = await request(app.getHttpServer())
                .get(`${path}/${getCategorySeeder()._id}/refs`)
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

    describe('admin/categories/:id (PATCH)', () => {
        it('should return one element of category with updated fields', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${path}/${getCategorySeeder()._id}`)
                .send({ title: 'New Title' })
                .expect(HttpStatus.OK);

            const category = plainToClass(Category, res.body, {
                exposeUnsetFields: false
            });
            expect(res.body).toMatchObject(category);
            expect(res.body.title).toBe('New Title');
        });

        it('should return OK without data', async () => {
            const category = await categoryModel
                .findById(getCategorySeeder()._id)
                .lean();

            const res = await request(app.getHttpServer())
                .patch(`${path}/${getCategorySeeder()._id}`)
                .expect(HttpStatus.OK);

            // Expect unchanged Object
            const resCategory = plainToClass(Category, res.body);
            const controllCategory = plainToClass(Category, category);
            expect(resCategory.choices).toMatchObject(controllCategory.choices);

            // Either delete __v updatedAt and createdAt or check the rest (2nd option is better)
            expect(resCategory.description).toBe(controllCategory.description);
            expect(resCategory.icon).toBe(controllCategory.icon);
            expect(resCategory.image).toBe(controllCategory.image);
            expect(resCategory.menu).toBe(controllCategory.menu);
            expect(resCategory.title).toBe(controllCategory.title);
        });

        it('should return OK with wrong param', async () => {
            const category = await categoryModel
                .findById(getCategorySeeder()._id)
                .lean();

            const res = await request(app.getHttpServer())
                .patch(`${path}/${getCategorySeeder()._id}`)
                .send({ wrongparam: 'something' })
                .expect(HttpStatus.OK);

            // Expect unchanged Object
            const resCategory = plainToClass(Category, res.body);
            const controllCategory = plainToClass(Category, category);
            expect(resCategory.choices).toMatchObject(controllCategory.choices);

            // Either delete __v updatedAt and createdAt or check the rest (chose 2nd)
            expect(resCategory.description).toBe(controllCategory.description);
            expect(resCategory.icon).toBe(controllCategory.icon);
            expect(resCategory.image).toBe(controllCategory.image);
            expect(resCategory.menu).toBe(controllCategory.menu);
            expect(resCategory.title).toBe(controllCategory.title);
        });

        it('should return NOT_FOUND with wrong id', async () => {
            await request(app.getHttpServer())
                .patch(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);
        });

        it('should return CONFLICT with duplicate title', async () => {
            await categoryModel.insertMany(getSampleCategory());
            await request(app.getHttpServer())
                .patch(`${path}/${getCategorySeeder()._id}`)
                .send({ title: getSampleCategory().title })
                .expect(HttpStatus.CONFLICT);
        });
    });

    describe('admin/categories/:id (DELETE)', () => {
        it('should return NO_CONTENT and empty the database with hard delete', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getCategorySeeder()._id}?type=hard`)
                .expect(HttpStatus.NO_CONTENT);

            expect(await categoryModel.find()).toHaveLength(0);
            // Expect dishes to have also been removed
            expect(await dishModel.find()).toHaveLength(0);
        });

        it('should return NO_CONTENT and not empty the database with soft delete', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getCategorySeeder()._id}?type=soft`)
                .expect(HttpStatus.NO_CONTENT);

            expect(await categoryModel.find()).toHaveLength(1);
            expect(
                (await categoryModel.findById(getCategorySeeder()._id)).status
            ).toBe(Status.DELETED);
        });

        it('should return NO_CONTENT and not empty the database with no query', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getCategorySeeder()._id}`)
                .expect(HttpStatus.NO_CONTENT);

            expect(await categoryModel.find()).toHaveLength(1);
            expect(
                (await categoryModel.findById(getCategorySeeder()._id)).status
            ).toBe(Status.DELETED);
        });

        it('should return NOT_FOUND and not empty the database with wrong id', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND);

            expect(await categoryModel.find()).toHaveLength(1);
        });

        it('should return NOT_FOUND and not empty the database with wrong id and type=hard', async () => {
            await request(app.getHttpServer())
                .delete(`${path}/${getWrongId()}?type=hard`)
                .expect(HttpStatus.NOT_FOUND);

            expect(await categoryModel.find()).toHaveLength(1);
        });
    });
});
