import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import { DishesModule } from '../src/dishes/dishes.module';
import { DishDocument } from '../src/dishes/entities/dish.entity';
import {
  closeInMongodConnection,
  rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import { getTestSetupData } from './__mocks__/dishMockData';

describe('DishController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let dishModel: Model<DishDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), DishesModule],
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

  describe('/dishes (GET)', () => {
    it('should return 200', async () => {
      await request(app.getHttpServer()).get('/dishes').expect(HttpStatus.OK);
    });
  });
});
