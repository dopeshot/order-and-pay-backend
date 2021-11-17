import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication


  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/category (GET)', () => {
      it("should return 200", async () => {
        await request(app.getHttpServer())
        .get('/category')
        .expect(200)
      })
  })

  
  afterAll(async () => {
    await app.close();
  });
});
