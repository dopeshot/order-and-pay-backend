import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication


  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init();
  });

  describe('/menu (GET)', () => {
    it("should return 200", async () => {
      await request(app.getHttpServer())
        .get('/menu')
        .expect(HttpStatus.OK)
    })
  })

  describe('/menu/current (GET)', () => {
    it("should return 204 (no active menu)", async () => {
      await request(app.getHttpServer())
        .get('/menu/current')
        .expect(HttpStatus.NO_CONTENT)
    })
  })


  afterAll(async () => {
    await app.close();
  });
});
