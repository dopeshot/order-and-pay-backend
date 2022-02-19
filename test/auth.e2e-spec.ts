import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/auth/strategies/jwt/jwt-auth.guard';
import { ClientModule } from '../src/client/client.module';
import { MenuDocument } from '../src/menus/entities/menu.entity';
import { MenusModule } from '../src/menus/menus.module';
import { TableDocument } from '../src/tables/entities/table.entity';
import { TablesModule } from '../src/tables/tables.module';
import { UserDocument } from '../src/users/entities/user.entity';
import { UserStatus } from '../src/users/enums/status.enum';
import { UsersModule } from '../src/users/users.module';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import { getMenuSeeder } from './__mocks__/menus-mock-data';
import { getSampleTable } from './__mocks__/tables-mock-data';
import { getJWT, getTestAdmin, getTestUser } from './__mocks__/users-mock-data';
const { mock } = require('nodemailer');

describe('AuthMdoule (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let userModel: Model<UserDocument>;
    let tableModel: Model<TableDocument>;
    let menuModel: Model<MenuDocument>;
    let authService: AuthService;
    let reflector: Reflector;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                AuthModule,
                MenusModule,
                UsersModule,
                ClientModule,
                TablesModule,
                ConfigModule.forRoot({
                    envFilePath: ['.env', '.development.env']
                })
            ]
        }).compile();

        connection = await module.get(getConnectionToken());
        authService = module.get<AuthService>(AuthService);
        userModel = connection.model('User');
        tableModel = connection.model('Table');
        menuModel = connection.model('Menu');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        reflector = app.get(Reflector);
        app.useGlobalGuards(new JwtAuthGuard(reflector));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        userModel.insertMany(await getTestAdmin());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await userModel.deleteMany();
        await tableModel.deleteMany();
        await menuModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
        await app.close();
    });

    describe('Auth basics', () => {
        describe('/auth/register (POST)', () => {
            it('should create an user', async () => {
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: (await getTestUser()).username,
                        email: (await getTestUser()).email,
                        password: '12345678'
                    })
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestAdmin())}`
                    )
                    .expect(HttpStatus.CREATED);
            });

            it('should create user with status active', async () => {
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: (await getTestUser()).username,
                        email: (await getTestUser()).email,
                        password: '12345678'
                    })
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestAdmin())}`
                    )
                    .expect(HttpStatus.CREATED);

                const user = userModel.findOne({
                    username: (await getTestUser()).username
                });
                expect((await user).status).toBe(UserStatus.ACTIVE);
            });

            it('should fail with duplicate mail', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: 'a mock user',
                        email: (await getTestUser()).email,
                        password: 'mensa essen'
                    })
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestAdmin())}`
                    )
                    .expect(HttpStatus.CONFLICT);
            });

            it('should fail with duplicate username', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: (await getTestUser()).username,
                        email: 'notMock@mock.mock',
                        password: 'mensa essen'
                    })
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestAdmin())}`
                    )
                    .expect(HttpStatus.CONFLICT);
            });
        });

        describe('/auth/login (POST)', () => {
            it('should return CREATED with valid data', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: (await getTestUser()).email,
                        password: 'mock password'
                    })
                    .expect(HttpStatus.CREATED);
            });

            it('should fail with wrong password', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: (await getTestUser()).email,
                        password: 'my grandmas birthday'
                    })
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('should fail with invalid email', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'notavalidemail@scam.org',
                        password: 'mock password'
                    })
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('should fail for banned users', async () => {
                let user = await getTestUser();
                user = { ...user, status: UserStatus.BANNED };
                await userModel.create(user);
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: user.email,
                        password: 'mock password'
                    })
                    .expect(HttpStatus.UNAUTHORIZED);
            });
        });
    });

    describe('Guard', () => {
        describe('JWT Guard', () => {
            it('Guard should block with invalid token', async () => {
                await request(app.getHttpServer())
                    .get('/users')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('Guard should block with no token', async () => {
                await request(app.getHttpServer())
                    .get('/users')
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('Guard should block when user is banned ', async () => {
                let user = await getTestUser();
                user = { ...user, status: UserStatus.BANNED };
                await userModel.create(user);

                await request(app.getHttpServer())
                    .get('/users')
                    .set(
                        'Authorization',
                        `Bearer ${await getJWT(await getTestUser())}`
                    )
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            describe('Allowed Endpoints', () => {
                it('Guard should allow if @Public() decorator is used ', async () => {
                    await menuModel.insertMany(getMenuSeeder()[0]);
                    await request(app.getHttpServer())
                        .get('/client/menu')
                        .expect(HttpStatus.OK);
                });

                it('Guard should allow if @Public() decorator is used ', async () => {
                    await tableModel.insertMany(getSampleTable());
                    await request(app.getHttpServer())
                        .post('/client/order')
                        .send({
                            tableNumber: getSampleTable().tableNumber,
                            items: [],
                            price: 0
                        })
                        .expect(HttpStatus.CREATED);
                });

                // The public endpoint auth/login is already tested above
            });
        });
    });
});
