import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { AdminModule } from '../src/admin/admin.module';
import { AllergensModule } from '../src/allergens/allergens.module';
import { AllergenDocument } from '../src/allergens/entities/allergen.entity';
import { CategoriesModule } from '../src/categories/categories.module';
import { CategoryDocument } from '../src/categories/entities/category.entity';
import { ClientModule } from '../src/client/client.module';
import { DishesModule } from '../src/dishes/dishes.module';
import { DishDocument } from '../src/dishes/entities/dish.entity';
import { LabelDocument } from '../src/labels/entities/label.entity';
import { LabelsModule } from '../src/labels/labels.module';
import { MenuDocument } from '../src/menus/entities/menu.entity';
import { Status } from '../src/menus/enums/status.enum';
import { MenusModule } from '../src/menus/menus.module';
import { MenuResponse } from '../src/menus/responses/menu.responses';
import { PopulatedMenuResponse } from '../src/menus/responses/populated-menu.response';
import { DeleteType } from '../src/shared/enums/delete-type.enum';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import { getCategorySeeder } from './__mocks__/categories-mock-data';
import {
    getAllergensForDishesSeeder,
    getDishSeeder,
    getLabelsForDishesSeeder
} from './__mocks__/dishes-mock-data';
import { getTestMenuData, getValidMenus } from './__mocks__/menus-mock-data';
import { getWrongId } from './__mocks__/shared-mock-data';

describe('MenuController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let dishModel: Model<DishDocument>;
    let categoryModel: Model<CategoryDocument>;
    let allergyModel: Model<AllergenDocument>;
    let labelModel: Model<LabelDocument>;
    let menuModel: Model<MenuDocument>;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                MenusModule,
                AdminModule,
                AllergensModule,
                DishesModule,
                LabelsModule,
                CategoriesModule,
                ClientModule
            ]
        }).compile();

        connection = await module.get(getConnectionToken());
        menuModel = connection.model('Menu');
        dishModel = connection.model('Dish');
        allergyModel = connection.model('Allergen');
        labelModel = connection.model('Label');
        categoryModel = connection.model('Category');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await menuModel.insertMany(getTestMenuData());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await menuModel.deleteMany();
        await dishModel.deleteMany();
        await allergyModel.deleteMany();
        await categoryModel.deleteMany();
        await labelModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('MenuModule', () => {
        describe('GET requests', () => {
            describe('menus (GET)', () => {
                it('should return all active menus', async () => {
                    const res = await request(app.getHttpServer())
                        .get('/menus')
                        .expect(HttpStatus.OK);

                    expect(res.body.length).toBe(getValidMenus().length);
                    expect(res.body[0]).toMatchObject(
                        new MenuResponse(res.body[0])
                    );
                });
            });

            describe('menus/:id (GET)', () => {
                it('should return the menu', async () => {
                    const res = await request(app.getHttpServer())
                        .get('/menus/' + getTestMenuData()[0]._id)
                        .expect(HttpStatus.OK);

                    expect(res.body).toMatchObject(
                        new MenuResponse(getTestMenuData()[0])
                    );
                });

                it('should fail with invalid Id', async () => {
                    await menuModel.deleteMany();
                    await request(app.getHttpServer())
                        .get('/menus/' + getTestMenuData()[0]._id)
                        .expect(HttpStatus.NOT_FOUND);
                });
            });

            describe('menus/:id/editor (GET)', () => {
                it('should return a thing', async () => {
                    await dishModel.insertMany(getDishSeeder());
                    await allergyModel.insertMany(
                        getAllergensForDishesSeeder()
                    );
                    await categoryModel.insertMany(getCategorySeeder());
                    await labelModel.insertMany(getLabelsForDishesSeeder());
                    const res = await request(app.getHttpServer())
                        .get('/menus/' + getTestMenuData()[0]._id + '/editor')
                        .expect(HttpStatus.OK);

                    // I am leaving these in so that anyone checking this for the media night can validate that it works...
                    console.log('menu:', res.body);
                    console.log('dish', res.body.categories[0].dishes[0]);

                    expect(res.body).toMatchObject(
                        new PopulatedMenuResponse(res.body)
                    );
                });

                it('should fail with invalid Id', async () => {
                    await menuModel.deleteMany();
                    await request(app.getHttpServer())
                        .get('/menus/' + getTestMenuData()[0]._id)
                        .expect(HttpStatus.NOT_FOUND);
                });
            });

            // This is in here so the inenevitable client test does not have to import all the modules
            describe('client/menu (GET)', () => {
                it('should currently active manu', async () => {
                    await dishModel.insertMany(getDishSeeder());
                    await allergyModel.insertMany(
                        getAllergensForDishesSeeder()
                    );
                    await categoryModel.insertMany(getCategorySeeder());
                    await labelModel.insertMany(getLabelsForDishesSeeder());
                    const res = await request(app.getHttpServer())
                        .get('/client/menu')
                        .expect(HttpStatus.OK);

                    // I am leaving these in so that anyone checking this for the media night can validate that it works...
                    console.log('menu:', res.body);
                    console.log('dish', res.body.categories[0].dishes[0]);

                    expect(res.body).toMatchObject(
                        new PopulatedMenuResponse(res.body)
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
                        getTestMenuData().length + 1
                    );

                    expect(res.body).toMatchObject(new MenuResponse(res.body));
                });

                it('should disable other menus if this is set to be active', async () => {
                    const previousActive = getTestMenuData().filter(
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
                        getTestMenuData().length + 1
                    );

                    expect(res.body).toMatchObject(new MenuResponse(res.body));
                    expect(res.body.isActive).toBe(true);

                    // Check if all endpoints have been disabled
                    previousActive.forEach(async (m) => {
                        const menu = await menuModel.findById(m._id);
                        expect(menu.isActive).toBe(false);
                        expect(menu.status).toBe(Status.INACTIVE);
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
                    const duplicate = getTestMenuData()[0];
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
            describe('admin/menu (PATCH)', () => {
                it('should update set', async () => {
                    const target = getTestMenuData()[0];
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
                    expect(res.body).not.toMatchObject(
                        new MenuResponse(target)
                    );
                });

                it('should disable other menus if this is set to be active', async () => {
                    const target = getTestMenuData()[0];
                    const previousActive = getTestMenuData()
                        .slice(1)
                        .filter(
                            (menu) =>
                                menu.isActive || menu.status === Status.ACTIVE
                        );
                    const res = await request(app.getHttpServer())
                        .patch('/menus/' + target._id)
                        .send({
                            isActive: true
                        })
                        .expect(HttpStatus.OK);

                    expect(res.body).toMatchObject(new MenuResponse(res.body));
                    expect(res.body.isActive).toBe(true);

                    // Check if all endpoints have been disabled
                    previousActive.forEach(async (m) => {
                        const menu = await menuModel.findById(m._id);
                        expect(menu.isActive).toBe(false);
                        expect(menu.status).toBe(Status.INACTIVE);
                    });
                });

                it('should fail for duplicates', async () => {
                    const target = getTestMenuData()[0];
                    const another = getTestMenuData()[1];
                    const res = await request(app.getHttpServer())
                        .patch('/menus/' + target._id)
                        .send({
                            description:
                                'where did you come from, where did you go, where did you come from',
                            title: another.title
                        })
                        .expect(HttpStatus.CONFLICT);
                });

                it('should fail with invalid data', async () => {
                    const target = getTestMenuData()[0];
                    const another = getTestMenuData()[1];
                    const res = await request(app.getHttpServer())
                        .patch('/menus/' + target._id)
                        .send({
                            title: 'x'
                        })
                        .expect(HttpStatus.BAD_REQUEST);
                });
            });
        });

        describe('DELETE requests', () => {
            describe('menus (PATCH)', () => {
                it('should delete menu (HARD delete)', async () => {
                    const target = getTestMenuData()[0];
                    await request(app.getHttpServer())
                        .delete('/menus/' + target._id)
                        .query({
                            type: DeleteType.HARD
                        })
                        .expect(HttpStatus.NO_CONTENT);

                    expect(await menuModel.findById(target._id)).toBe(null);
                });

                it('should set menu deleted (SOFT delete)', async () => {
                    const target = getTestMenuData()[0];
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
                    const target = getTestMenuData()[0];
                    await request(app.getHttpServer())
                        .delete('/menus/' + target._id)
                        .expect(HttpStatus.NO_CONTENT);

                    expect(
                        await (
                            await menuModel.findById(target._id)
                        ).status
                    ).toBe(Status.DELETED);
                });

                it('should fail with invalid id', async () => {
                    await request(app.getHttpServer())
                        .delete(`/menus/${getWrongId()}`)
                        .query({
                            type: DeleteType.SOFT
                        })
                        .expect(HttpStatus.NOT_FOUND);
                });
            });
        });

        afterAll(async () => {
            await connection.close();
            closeInMongodConnection();
        });
    });
});
