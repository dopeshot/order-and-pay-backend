import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { MenuDocument } from '../src/menu/entities/menu.entity';
import * as request from 'supertest';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from './helpers/MongoMemoryHelpers';
import { MenuModule } from '../src/menu/menu.module';
import { getTestSetupData } from './__mocks__/menuMockData';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let menuModel: Model<MenuDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), MenuModule],
    }).compile();

    connection = await module.get(getConnectionToken());
    menuModel = connection.model('Menu');
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  // Insert test data
  beforeEach(async () => {
    await menuModel.insertMany(getTestSetupData());
  });

  // Empty the collection from all possible impurities
  afterEach(async () => {
    await menuModel.deleteMany();
  });

  afterAll(async () => {
    await connection.close();
    closeInMongodConnection();
  });
  describe('/menu (GET)', () => {
    it('should return 200', async () => {
      await request(app.getHttpServer()).get('/menu').expect(HttpStatus.OK);
    });
  });

  describe('/menu/current (GET)', () => {
    it('should return 204 (no active menu)', async () => {
      await request(app.getHttpServer())
        .get('/menu/current')
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  afterAll(async () => {
    await connection.close();
    closeInMongodConnection();
  });
});
