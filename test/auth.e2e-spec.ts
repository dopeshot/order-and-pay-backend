import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { UserDocument } from '../src/users/entities/user.entity';
import { UserStatus } from '../src/users/enums/status.enum';
import { UsersModule } from '../src/users/users.module';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import { getJWT, getTestUser } from './__mocks__/users-mock-data';
const { mock } = require('nodemailer');

describe('AuthMdoule (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let userModel: Model<UserDocument>;
    let authService: AuthService;

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
        authService = module.get<AuthService>(AuthService);
        userModel = connection.model('User');
        app = module.createNestApplication();
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

    describe('Auth basics', () => {
        describe('/auth/register (POST)', () => {
            it('/auth/register (POST)', async () => {
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: 'fictional user',
                        email: 'fictional@gmail.com',
                        password: '12345678'
                    })
                    .expect(HttpStatus.CREATED);
            });

            it('/auth/register (POST) duplicate mail', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: 'a mock user',
                        email: 'mock@mock.mock',
                        password: 'mensa essen'
                    })
                    .expect(HttpStatus.CONFLICT);
            });

            it('/auth/register (POST) duplicate username', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/register')
                    .send({
                        username: 'mock',
                        email: 'notMock@mock.mock',
                        password: 'mensa essen'
                    })
                    .expect(HttpStatus.CONFLICT);
            });
        });

        describe('/auth/login (POST)', () => {
            it('/auth/login (POST)', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'mock@mock.mock',
                        password: 'mock password'
                    })
                    .expect(HttpStatus.CREATED);
            });

            it('/auth/login (POST) Wrong Password', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'mock@mock.mock',
                        password: 'my grandmas birthday'
                    })
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('/auth/login (POST) Wrong Email', async () => {
                await userModel.create(await getTestUser());
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'peter@mock.mock',
                        password: 'mock password'
                    })
                    .expect(HttpStatus.UNAUTHORIZED);
            });

            it('/auth/login (POST) Banned User', async () => {
                // add provide to test user
                let user = await getTestUser();
                user = { ...user, status: UserStatus.BANNED };
                await userModel.create(user);
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        email: 'mock@mock.mock',
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
        });
    });
});
