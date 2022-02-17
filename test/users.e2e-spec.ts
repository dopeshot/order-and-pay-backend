import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { Connection, Model } from 'mongoose';
import { join } from 'path';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { User, UserDocument } from '../src/users/entities/user.entity';
import { UsersModule } from '../src/users/users.module';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import { getJWT, getTestAdmin, getTestUser } from './__mocks__/users-mock-data';
const { mock } = require('nodemailer');

describe('UserModule (e2e)', () => {
    let app: NestExpressApplication;
    let connection: Connection;
    let userModel: Model<UserDocument>;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                UsersModule,
                AuthModule,
                ConfigModule.forRoot({
                    envFilePath: ['.env', '.development.env']
                })
            ]
        }).compile();

        connection = await module.get(getConnectionToken());
        userModel = connection.model('User');

        // Using a full nest application is necessary
        // https://github.com/jmcdo29/testing-nestjs/commit/0544f34ce02c1a42179aae7f36cb11fb3b62fb22
        // https://github.com/jmcdo29/testing-nestjs/issues/74
        app = module.createNestApplication<NestExpressApplication>();
        app.setBaseViewsDir(join(__dirname, '..', 'views'));
        app.setViewEngine('ejs');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {});

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await userModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
        await app.close();
    });

    describe('User basics', () => {
        describe('/users (GET)', () => {
            it('/users (GET) should return array', async () => {
                const user = await getTestAdmin();
                await userModel.insertMany([user]);
                const res = await request(app.getHttpServer())
                    .get('/users')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestAdmin())}`
                    )
                    .expect(HttpStatus.OK);

                expect(res.body.length).toBe(1);

                // test user response
                const usr = plainToClass(User, res.body);
                expect(res.body).toMatchObject(usr);
            });
        });

        describe('/users/profile (GET)', () => {
            it('/users/profile (GET) ', async () => {
                const user = await getTestUser();
                await userModel.create(user);
                const res = await request(app.getHttpServer())
                    .get('/users/profile')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.OK);

                // Test user response
                const response = plainToClass(User, res.body);
                expect(res.body).toMatchObject(response);
            });
        });

        describe('/users/:id (PATCH)', () => {
            it('/users/:id (PATCH) should patch user', async () => {
                await userModel.create(await getTestUser());
                const res = await request(app.getHttpServer())
                    .patch('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .send({
                        username: 'test-user-updated'
                    })
                    .expect(HttpStatus.OK);
                const user = await userModel.findOne();
                expect(user.username).toBe('test-user-updated');

                // Test user response
                const response = plainToClass(User, res.body);
                expect(res.body).toMatchObject(response);
            });

            it('/users/:id (PATCH) should fail with duplicate', async () => {
                await userModel.create(await getTestUser());
                await userModel.create(await getTestAdmin());
                await request(app.getHttpServer())
                    .patch('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .send({
                        username: 'admin'
                    })
                    .expect(HttpStatus.CONFLICT);
            });

            it('/users/:id (PATCH) should fail when patching other user', async () => {
                await userModel.create(await getTestUser());
                await userModel.create(await getTestAdmin());
                await request(app.getHttpServer())
                    .patch('/users/61bb7c9883fdff2f24bf779d')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.FORBIDDEN);
            });
        });

        describe('/users/:id (DELETE)', () => {
            it('/users/:id (DELETE) should delete user', async () => {
                const user = await getTestUser();
                await userModel.create(user);
                const res = await request(app.getHttpServer())
                    .delete('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.NO_CONTENT);
                expect((await userModel.find()).length).toBe(0);
            });

            it('/users/:id (DELETE) should fail when deleting other user', async () => {
                await userModel.create(await getTestUser());
                await userModel.create(await getTestAdmin());
                await request(app.getHttpServer())
                    .delete('/users/61bb7c9883fdff2f24bf779d')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.FORBIDDEN);
            });
        });
    });

    describe('Guard', () => {
        describe('JWTGuard', () => {
            it('/users/:id (DELETE) should fail with invalid token', async () => {
                await request(app.getHttpServer())
                    .delete('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('/users/profile (GET) should fail with invalid token', async () => {
                await request(app.getHttpServer())
                    .get('/users/profile')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('/users/:id (PATCH) should fail with invalid token', async () => {
                await request(app.getHttpServer())
                    .patch('/users/61bb7c9983fdff2f24bf77a8')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });
        });
    });
});
