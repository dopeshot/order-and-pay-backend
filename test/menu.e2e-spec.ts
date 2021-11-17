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

  describe('/menu (GET)', () => {
      it("should return 200", async () => {
        await request(app.getHttpServer())
        .get('/menu')
        .expect(200)
      })
  })

  describe('/menu/current (GET)', () => {
    it("should return 204 (no active menu)", async () => {
      await request(app.getHttpServer())
      .get('/menu/current')
      .expect(204)
    })
})

  
  afterAll(async () => {
    await app.close();
  });
});
