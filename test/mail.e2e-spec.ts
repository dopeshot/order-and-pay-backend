'use strict';
//NestJS imports
import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

//node imports
import * as request from 'supertest';

//project imports
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from './helpers/MongoMemoryHelpers';
import { AppModule } from '../src/app.module';

const { mock } = require('nodemailer');

let app: NestExpressApplication;
let connection: Connection;
let token: string;

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
  // Mockmailer should be reset and not throw artificial errors
  mock.reset();
  mock.setShouldFail(false);
});

afterAll(async () => {
  let res = request(app.getHttpServer())
    .get('/user/profile')
    .set('Authorization', `Bearer ${token}`);

  let userId = (await res).body.userId;

  await request(app.getHttpServer())
    .delete(`/user/${userId}`)
    .set('Authorization', `Bearer ${token}`);

  await connection.close();
  await app.close()
  closeInMongodConnection();
});

describe('sendMail', () => {
  it('should return 201 to valid request', async () => {
    const res = await request(app.getHttpServer())
      .post('/mail')
      .set('Content-Type', 'application/json')
      .send({
        recipient: 'unit1@test.mock',
      })
      .expect(HttpStatus.CREATED);
  });

  it('should send email', async () => {
    const res = await request(app.getHttpServer())
      .post('/mail')
      .set('Content-Type', 'application/json')
      .send({
        recipient: 'unit2@test.mock',
      });

    const sendMails = mock.getSentMail();

    expect(sendMails.length).toBe(1);
  });

  it('should send email with test content', async () => {
    await request(app.getHttpServer())
      .post('/mail')
      .set('Content-Type', 'application/json')
      .send({
        recipient: 'unit2@test.mock',
      })
      .expect(HttpStatus.CREATED);

    const receivedMail = mock.getSentMail()[0];

    expect(receivedMail.subject).toBe('test');
    expect(receivedMail.html).toBe('this is a dummy endpoint');
  });

  it('should return an error if Mail fails to send', async () => {
    mock.setShouldFail(true);
    await request(app.getHttpServer())
      .post('/mail')
      .set('Content-Type', 'application/json')
      .send({
        recipient: 'unit2@test.mock',
      })
      .expect(HttpStatus.SERVICE_UNAVAILABLE);
  });
});

describe('generateVerifyMail', () => {
  it('/auth/register (POST) should send mail verification', async () => {
    const res = request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'unit test',
        email: 'dummy@unit.test',
        password: 'verysecurepassword',
      })
      .expect(HttpStatus.CREATED);

    token = (await res).body.access_token;

    //checking send mail (content is ignored as this would make changing templates annoying)
    const sendMails = mock.getSentMail();
    expect(sendMails.length).toBe(1);
    expect(sendMails[0].to).toBe('dummy@unit.test');
  });
});
