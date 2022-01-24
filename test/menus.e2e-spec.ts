import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { MenuDocument } from '../src/menus/entities/menu.entity';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import { MenusModule } from '../src/menus/menus.module';
import { getTestMenuData, getValidMenus, getWrongId } from './__mocks__/menuMockData';
import * as request from 'supertest';
import { MenuResponse } from '../src/menus/responses/menu.responses';
import { AdminModule } from '../src/admin/admin.module';
import { DeleteType } from '../src/admin/enums/delete-type.enum';
import { Status } from '../src/menus/enums/status.enum';

describe('MenuController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let menuModel: Model<MenuDocument>;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [rootMongooseTestModule(), MenusModule, AdminModule]
        }).compile();

        connection = await module.get(getConnectionToken());
        menuModel = connection.model('Menu');
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
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('MenuModule', () => {
        describe('GET requests', () => {
            describe('admin/menus (GET)', () => {
                it('should return all active menus', async () => {
                    const res = await request(app.getHttpServer())
                        .get('/admin/menus')
                        .expect(HttpStatus.OK);

                    expect(res.body.length).toBe(getValidMenus().length);
                    expect(res.body[0]).toMatchObject(
                        new MenuResponse(res.body[0])
                    );
                });
            });
        });

        describe('POST request', () => {
            describe('admin/menus (POST)', () => {
                it('should create new menu', async () => {
                    const res = await request(app.getHttpServer())
                        .post('/admin/menus')
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

                it('should fail with invalid data', async () => {
                    await request(app.getHttpServer())
                        .post('/admin/menus')
                        .send({
                            error: 'what even is this?'
                        })
                        .expect(HttpStatus.BAD_REQUEST);
                });

                it('should fail with duplicate title', async () => {
                    const duplicate = getTestMenuData()[0];
                    await request(app.getHttpServer())
                        .post('/admin/menus')
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
                        .patch('/admin/menus/' + target._id)
                        .send({
                            description:'where did you come from, where did you go, where did you come from',
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

                it('should fail for duplicates', async () => {
                    const target = getTestMenuData()[0];
                    const another = getTestMenuData()[1];
                    const res = await request(app.getHttpServer())
                        .patch('/admin/menus/' + target._id)
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
                        .patch('/admin/menus/' + target._id)
                        .send({
                            not: 'this is not a field'
                        })
                        .expect(HttpStatus.BAD_REQUEST);
                });
            });
        });

        describe('DELETE requests', () => {
            describe('admin/menus (PATCH)', () => {
                it('should delete menu (HARD delete)', async () => {
                    const target = getTestMenuData()[0];
                    await request(app.getHttpServer())
                        .delete('/admin/menus/' + target._id)
                        .query({
                            type: DeleteType.HARD
                        })
                        .expect(HttpStatus.NO_CONTENT);
                    
                    expect(await(menuModel.findById(target._id))).toBe(null)
                });

                it('should set menu deleted (SOFT delete)', async () => {
                    const target = getTestMenuData()[0];
                    await request(app.getHttpServer())
                        .delete('/admin/menus/' + target._id)
                        .query({
                            type: DeleteType.SOFT
                        })
                        .expect(HttpStatus.NO_CONTENT);
                    
                    expect(await(await (menuModel.findById(target._id))).status).toBe(Status.DELETED)
                });

                it('should set menu deleted (SOFT delete) without provided type', async () => {
                    const target = getTestMenuData()[0];
                    await request(app.getHttpServer())
                        .delete('/admin/menus/' + target._id)
                        .expect(HttpStatus.NO_CONTENT);
                    
                    expect(await(await (menuModel.findById(target._id))).status).toBe(Status.DELETED)
                });

                it('should fail with invalid id', async () => {
                     await request(app.getHttpServer())
                        .delete(`/admin/menus/${getWrongId()}`)
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