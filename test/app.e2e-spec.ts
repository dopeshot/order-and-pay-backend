import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let token
  let userId


  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Auth and User', () => {
    it('/auth/register (POST)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: "Zoe",
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(201)

      token = res.body.access_token
      return res
    })
    
    it('/auth/register (POST) duplicate', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: "Zoe",
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(409)
      return res
    })

    it('/auth/login (POST)', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "zoe@gmail.com",
          password: "12345678"
        })
        .expect(201)
    })

    it('/auth/login (POST) Wrong Password', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "zoe@gmail.com",
          password: "123"
        })
        .expect(401)
    })

    it('/user/profile (GET)', async () => {
      const res = request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      userId = (await res).body.userId
      return res
    })
  })

  describe("Roles", () => {
    it('/user (GET) Protected Route: No Admin Role', async () => {
      const res = request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
      return res
    })

    it('/user/testing (PATCH) Change to Admin', async () => {
      const res = request(app.getHttpServer())
        .patch(`/user/testing/${userId}`)
        .send({
          role: "admin"
        })
        .expect(200)
      return res
    })

    it('/auth/login (POST)', async () => {
      const res = request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "zoe@gmail.com",
        password: "12345678"
      })
      .expect(201)

      token = (await res).body.access_token
      return res
    })

    it('/user (GET) Protected Route: Admin Role', async () => {
      const res = request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      return res
    })
  })
  /*

  describe('Cleanup', () => {
    it('/user/:id (DELETE)', async () => {
      const res = request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      return res
    })
  })
  */
  afterAll(async () => {
    await app.close();
  });
});
