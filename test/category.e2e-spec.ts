import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { CategoriesModule } from '../src/category/categories.module';
import { CategoryDocument } from '../src/category/entities/category.entity';
import * as request from 'supertest';
import { rootMongooseTestModule, closeInMongodConnection } from './helpers/MongoMemoryHelpers';
import { getTestSetupData } from './__mocks__/categoryMockData';

describe('CategoryController(e2e)', () => {
  let app: INestApplication
  let connection: Connection
  let categoryModel: Model<CategoryDocument>


  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
        imports: [
            rootMongooseTestModule(),
            CategoriesModule,
        ]
    }).compile();

    connection = await module.get(getConnectionToken());
    categoryModel = connection.model('Category')
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({whitelist: true}))
    await app.init();
});

// Insert test data
beforeEach(async () => {
    await categoryModel.insertMany(getTestSetupData())
})

// Empty the collection from all possible impurities
afterEach(async () => {
    await categoryModel.deleteMany()
})

afterAll(async () => {
    await connection.close()
    closeInMongodConnection()
    await app.close()
})

  describe('/category (GET)', () => {
    it("should return 200", async () => {
      await request(app.getHttpServer())
        .get('/category')
        .expect(HttpStatus.OK)
    })
  })
});
