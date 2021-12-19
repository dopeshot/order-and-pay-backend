import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from './helpers/MongoMemoryHelpers';
import { getTestSetupData } from './__mocks__/dishMockData';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let token;
  let userId;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AppModule],
    }).compile();

    connection = await module.get(getConnectionToken());
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  // Insert test data
  beforeEach(async () => {
    // TODO
  });

  // Empty the collection from all possible impurities
  afterEach(async () => {
    // TODO
  });

  afterAll(async () => {
    await connection.close();
    closeInMongodConnection();
    await app.close()
  });

  describe('Auth and User', () => {
    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'Zoe',
          email: 'zoe@gmail.com',
          password: '12345678',
        })
        .expect(HttpStatus.CREATED);

      token = res.body.access_token;
      return res;
    });

    it('/auth/register (POST) duplicate', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'Zoe',
          email: 'zoe@gmail.com',
          password: '12345678',
        })
        .expect(409);
      return res;
    });

    it('/auth/login (POST)', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'zoe@gmail.com',
          password: '12345678',
        })
        .expect(HttpStatus.CREATED);
    });

    it('/auth/login (POST) Wrong Password', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'zoe@gmail.com',
          password: '123',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/user/profile (GET)', async () => {
      const res = request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);
      userId = (await res).body.userId;
      return res;
    });
  });

  describe('Roles', () => {
    it('/user (GET) Protected Route: No Admin Role', async () => {
      const res = request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN);
      return res;
    });

    it('/user/testing (PATCH) Change to Admin', async () => {
      const res = request(app.getHttpServer())
        .patch(`/user/testing/${userId}`)
        .send({
          role: 'admin',
        })
        .expect(HttpStatus.OK);
      return res;
    });

    it('/auth/login (POST)', async () => {
      const res = request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'zoe@gmail.com',
          password: '12345678',
        })
        .expect(HttpStatus.CREATED);

      token = (await res).body.access_token;
      return res;
    });

    it('/user (GET) Protected Route: Admin Role', async () => {
      const res = request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);
      return res;
    });
  });
});
