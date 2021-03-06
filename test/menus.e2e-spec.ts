import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { AdminModule } from '../src/admin/admin.module';
import { AllergensModule } from '../src/allergens/allergens.module';
import {
    Allergen,
    AllergenDocument
} from '../src/allergens/entities/allergen.entity';
import { CategoriesModule } from '../src/categories/categories.module';
import {
    Category,
    CategoryDocument
} from '../src/categories/entities/category.entity';
import { ClientModule } from '../src/client/client.module';
import { DishesModule } from '../src/dishes/dishes.module';
import { Dish, DishDocument } from '../src/dishes/entities/dish.entity';
import { Label, LabelDocument } from '../src/labels/entities/label.entity';
import { LabelsModule } from '../src/labels/labels.module';
import {
    Menu,
    MenuDocument,
    MenuPopulated
} from '../src/menus/entities/menu.entity';
import { Status } from '../src/menus/enums/status.enum';
import { MenusModule } from '../src/menus/menus.module';
import { DeleteType } from '../src/shared/enums/delete-type.enum';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import {
    getCategoriesSeeder,
    getCategorySeeder
} from './__mocks__/categories-mock-data';
import {
    getAllergensForDishesSeeder,
    getDishesSeeder,
    getDishSeeder,
    getLabelsForDishesSeeder
} from './__mocks__/dishes-mock-data';
import {
    getCategoryForMenu,
    getDishForMenu,
    getMenuSeeder,
    getValidMenus
} from './__mocks__/menus-mock-data';
import { getWrongId } from './__mocks__/shared-mock-data';

describe('MenuController (e2e)', () => {
    let reflector: Reflector;
    let app: INestApplication;
    let connection: Connection;
    let dishModel: Model<DishDocument>;
    let menuModel: Model<MenuDocument>;
    let labelModel: Model<LabelDocument>;
    let allergenModel: Model<AllergenDocument>;
    let categoryModel: Model<CategoryDocument>;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                MenusModule,
                AdminModule,
                DishesModule,
                LabelsModule,
                ClientModule,
                AllergensModule,
                CategoriesModule
            ]
        }).compile();

        connection = await module.get(getConnectionToken());
        menuModel = connection.model(Menu.name);
        dishModel = connection.model(Dish.name);
        labelModel = connection.model(Label.name);
        allergenModel = connection.model(Allergen.name);
        categoryModel = connection.model(Category.name);
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await menuModel.insertMany(getMenuSeeder());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await menuModel.deleteMany();
        await dishModel.deleteMany();
        await allergenModel.deleteMany();
        await categoryModel.deleteMany();
        await labelModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('GET requests', () => {
        describe('menus (GET)', () => {
            it('should return all active menus', async () => {
                const res = await request(app.getHttpServer())
                    .get('/menus')
                    .expect(HttpStatus.OK);

                expect(res.body.length).toBe(getValidMenus().length);
                expect(res.body[0]).toMatchObject(
                    plainToClass(Menu, res.body[0])
                );
            });
        });

        describe('menus/:id (GET)', () => {
            it('should return the menu', async () => {
                const res = await request(app.getHttpServer())
                    .get('/menus/' + getMenuSeeder()[0]._id)
                    .expect(HttpStatus.OK);

                expect(res.body).toMatchObject(
                    plainToClass(Menu, getMenuSeeder()[0])
                );
            });

            it('should fail with invalid Id', async () => {
                await menuModel.deleteMany();
                await request(app.getHttpServer())
                    .get('/menus/' + getMenuSeeder()[0]._id)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });

        describe('menus/:id/refs (GET)', () => {
            it('return an array of categories', async () => {
                await categoryModel.insertMany(getCategoryForMenu());
                const res = await request(app.getHttpServer())
                    .get(`/menus/${getMenuSeeder()[0]._id}/refs`)
                    .expect(HttpStatus.OK);

                expect(res.body).toHaveLength(1);
            });

            it('should return empty array', async () => {
                await categoryModel.insertMany(getCategoryForMenu());
                const res = await request(app.getHttpServer())
                    .get(`/menus/${getWrongId()}/refs`)
                    .expect(HttpStatus.OK);

                expect(res.body).toHaveLength(0);
            });
        });

        describe('menus/:id/editor (GET)', () => {
            it('should return a populated menu', async () => {
                await dishModel.insertMany(getDishesSeeder());
                await allergenModel.insertMany(getAllergensForDishesSeeder());
                await categoryModel.insertMany(getCategoriesSeeder());
                await labelModel.insertMany(getLabelsForDishesSeeder());
                const res = await request(app.getHttpServer())
                    .get('/menus/' + getMenuSeeder()[0]._id + '/editor')
                    .expect(HttpStatus.OK);

                // Check contents of populated menu
                const expectedCategories = getCategoriesSeeder();
                const dishes = getDishesSeeder();
                const allergens = getAllergensForDishesSeeder();
                const labels = getLabelsForDishesSeeder();

                // Check if categories are populated correctly
                expect(res.body.categories.length).toBe(
                    expectedCategories.length
                );

                res.body.categories.forEach((category) => {
                    expect(
                        res.body.categories.find(
                            (c) => c._id === expectedCategories[0]._id
                        )
                    ).toBeDefined();
                    // Check if dishes are populated correctly
                    category.dishes.forEach((dish) => {
                        expect(dish.categoryId).toEqual(category._id);
                        expect(
                            dishes.find(
                                (d) => d._id.toString() === dish._id.toString()
                            )
                        ).toBeDefined();
                        // Check if labels are populated correctly
                        dish.labelIds.forEach((label) => {
                            expect(
                                labels.find(
                                    (l) =>
                                        l._id.toString() ===
                                        label._id.toString()
                                )
                            ).toBeDefined();
                        });

                        // Check if allergens are populated correctly
                        dish.allergenIds.forEach((allergen) => {
                            expect(
                                allergens.find(
                                    (a) =>
                                        a._id.toString() ===
                                        allergen._id.toString()
                                )
                            ).toBeDefined();
                        });
                    });
                });

                expect(res.body).toMatchObject(
                    plainToClass(MenuPopulated, res.body, {
                        exposeUnsetFields: false
                    })
                );
            });

            it('should not return soft deleted dishes', async () => {
                const dishes = getDishesSeeder().map((dish) => ({
                    ...dish,
                    status: Status.DELETED
                }));
                await dishModel.insertMany(dishes);
                await allergenModel.insertMany(getAllergensForDishesSeeder());
                await categoryModel.insertMany(getCategoriesSeeder());
                await labelModel.insertMany(getLabelsForDishesSeeder());
                const res = await request(app.getHttpServer())
                    .get('/menus/' + getMenuSeeder()[0]._id + '/editor')
                    .expect(HttpStatus.OK);

                res.body.categories.forEach((category) => {
                    expect(category.dishes.length).toBe(0);
                });
            });

            it('should return empty with an empty menu', async () => {
                const res = await request(app.getHttpServer())
                    .get('/menus/' + getMenuSeeder()[0]._id + '/editor')
                    .expect(HttpStatus.OK);
                expect(res.body.categories.length).toBe(0);
            });

            it('should return NOT_FOUND with wrong Id', async () => {
                await request(app.getHttpServer())
                    .get(`/menus/${getWrongId()}/editor`)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });

        // This is in here so the inenevitable client test does not have to import all the modules
        describe('client/menu (GET)', () => {
            it('should currently active menu', async () => {
                await dishModel.insertMany(getDishSeeder());
                await allergenModel.insertMany(getAllergensForDishesSeeder());
                await categoryModel.insertMany(getCategorySeeder());
                await labelModel.insertMany(getLabelsForDishesSeeder());
                const res = await request(app.getHttpServer())
                    .get('/client/menu')
                    .expect(HttpStatus.OK);

                expect(res.body).toMatchObject(
                    plainToClass(MenuPopulated, res.body, {
                        exposeUnsetFields: false
                    })
                );
            });

            it('should fail with invalid Id', async () => {
                await menuModel.deleteMany();
                await request(app.getHttpServer())
                    .get('/client/menu')
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
    });

    describe('POST request', () => {
        describe('menus (POST)', () => {
            it('should create new menu', async () => {
                const res = await request(app.getHttpServer())
                    .post('/menus')
                    .send({
                        title: 'new menu',
                        description: 'mock me harder daddy'
                    })
                    .expect(HttpStatus.CREATED);

                expect((await menuModel.find()).length).toBe(
                    getMenuSeeder().length + 1
                );

                expect(res.body).toMatchObject(plainToClass(Menu, res.body));
            });

            it('should disable other menus if this is set to be active', async () => {
                const previousActive = getMenuSeeder().filter(
                    (menu) => menu.isActive || menu.status === Status.ACTIVE
                );
                const res = await request(app.getHttpServer())
                    .post('/menus')
                    .send({
                        title: 'new menu',
                        description: 'mock me harder daddy',
                        isActive: true
                    })
                    .expect(HttpStatus.CREATED);

                expect((await menuModel.find()).length).toBe(
                    getMenuSeeder().length + 1
                );

                expect(res.body).toMatchObject(plainToClass(Menu, res.body));
                expect(res.body.isActive).toBe(true);

                // Check if all endpoints have been disabled
                previousActive.forEach(async (m) => {
                    const menu = await menuModel.findById(m._id);
                    expect(menu.isActive).toBe(false);
                });
            });

            it('should fail with invalid data', async () => {
                await request(app.getHttpServer())
                    .post('/menus')
                    .send({
                        error: 'what even is this?'
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should fail with duplicate title', async () => {
                const duplicate = getMenuSeeder()[0];
                await request(app.getHttpServer())
                    .post('/menus')
                    .send({
                        title: duplicate.title,
                        description: 'mock me harder daddy'
                    })
                    .expect(HttpStatus.CONFLICT);
            });
        });
    });

    describe('PATCH requests', () => {
        describe('menus/:id (PATCH)', () => {
            it('should update set', async () => {
                const target = getMenuSeeder()[0];
                const res = await request(app.getHttpServer())
                    .patch('/menus/' + target._id)
                    .send({
                        description:
                            'where did you come from, where did you go, where did you come from',
                        title: 'Cotton eye joe'
                    })
                    .expect(HttpStatus.OK);

                expect(res.body.description).toBe(
                    'where did you come from, where did you go, where did you come from'
                );
                expect(res.body.title).toBe('Cotton eye joe');
                expect(res.body).not.toMatchObject(plainToClass(Menu, target));
            });

            it('should disable other menus if this is set to be active', async () => {
                const target = getMenuSeeder()[0];
                const previousActive = getMenuSeeder()
                    .slice(1)
                    .filter(
                        (menu) => menu.isActive || menu.status === Status.ACTIVE
                    );
                const res = await request(app.getHttpServer())
                    .patch('/menus/' + target._id)
                    .send({
                        isActive: true
                    })
                    .expect(HttpStatus.OK);

                expect(res.body).toMatchObject(plainToClass(Menu, res.body));
                expect(res.body.isActive).toBe(true);

                const menus = await menuModel.find();
                // Check if all menus have been disabled
                previousActive.forEach(async (m) => {
                    const menu = menus.find(
                        (menu) => m._id === menu._id.toString()
                    );
                    expect(menu.isActive).toBe(false);
                });
            });

            it('should fail for duplicates', async () => {
                const target = getMenuSeeder()[0];
                const another = getMenuSeeder()[1];
                await request(app.getHttpServer())
                    .patch('/menus/' + target._id)
                    .send({
                        description:
                            'where did you come from, where did you go, where did you come from',
                        title: another.title
                    })
                    .expect(HttpStatus.CONFLICT);
            });

            it('should fail with invalid data', async () => {
                const target = getMenuSeeder()[0];
                await request(app.getHttpServer())
                    .patch('/menus/' + target._id)
                    .send({
                        title: 'x'
                    })
                    .expect(HttpStatus.BAD_REQUEST);
            });

            it('should return NOT_FOUND with wrong id', async () => {
                await request(app.getHttpServer())
                    .patch(`/menus/${getWrongId()}`)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
    });

    describe('DELETE requests', () => {
        describe('menus/:id (DELETE)', () => {
            it('should delete menu (HARD delete) and recursively remove categoies and dishes', async () => {
                await categoryModel.insertMany(getCategoryForMenu());
                await dishModel.insertMany(getDishForMenu());

                await request(app.getHttpServer())
                    .delete('/menus/' + getMenuSeeder()[0]._id)
                    .query({
                        type: DeleteType.HARD
                    })
                    .expect(HttpStatus.NO_CONTENT);

                expect(
                    await menuModel.findById(getMenuSeeder()[0]._id)
                ).toBeNull();
                expect(await categoryModel.find()).toHaveLength(0);
                expect(await dishModel.find()).toHaveLength(0);
            });

            it('should set menu deleted (SOFT delete)', async () => {
                const target = getMenuSeeder()[0];
                await request(app.getHttpServer())
                    .delete('/menus/' + target._id)
                    .query({
                        type: DeleteType.SOFT
                    })
                    .expect(HttpStatus.NO_CONTENT);

                expect(
                    await (
                        await menuModel.findById(target._id)
                    ).status
                ).toBe(Status.DELETED);
            });

            it('should set menu deleted (SOFT delete) without provided type', async () => {
                const target = getMenuSeeder()[0];
                await request(app.getHttpServer())
                    .delete('/menus/' + target._id)
                    .expect(HttpStatus.NO_CONTENT);

                expect(
                    await (
                        await menuModel.findById(target._id)
                    ).status
                ).toBe(Status.DELETED);
            });

            it('should return NOT_FOUND with wrong id on Soft delete', async () => {
                await request(app.getHttpServer())
                    .delete(`/menus/${getWrongId()}`)
                    .query({
                        type: DeleteType.SOFT
                    })
                    .expect(HttpStatus.NOT_FOUND);
            });

            it('should return NOT_FOUND with wrong id on Hard delete', async () => {
                await request(app.getHttpServer())
                    .delete(`/menus/${getWrongId()}`)
                    .query({
                        type: DeleteType.HARD
                    })
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
    });
});
