import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DishDocument } from '../src/dish/entities/dish.entity';
import { Connection, Model } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { DishModule } from '../src/dish/dish.module';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from './helpers/MongoMemoryHelpers';
import { getTestSetupData } from './__mocks__/dishMockData';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let dishModel: Model<DishDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), DishModule],
    }).compile();

    connection = await module.get(getConnectionToken());
    dishModel = connection.model('Dish');
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  // Insert test data
  beforeEach(async () => {
    await dishModel.insertMany(getTestSetupData());
  });

  // Empty the collection from all possible impurities
  afterEach(async () => {
    await dishModel.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    closeInMongodConnection();
  });

  describe('/dish (GET)', () => {
    it('should return 200', async () => {
      await request(app.getHttpServer()).get('/dish').expect(HttpStatus.OK);
    });
  });
});
