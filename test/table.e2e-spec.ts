import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, ObjectId } from 'mongoose';
import { timeout } from 'rxjs';
import { ResponseTable } from 'src/table/types/response';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SetController (e2e)', () => {
    let app: INestApplication
    let connection: Connection
    let responseTable: ResponseTable
    const mockTable = {
        tableNumber: "1",
        capacity: 4,
        createdBy: "12"
    }

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        connection = await moduleFixture.get(getConnectionToken());
        await connection.dropDatabase()
    });

    afterAll(async () => {
        await connection.close()
        await app.close();
    })

    /*---------------------\ 
    |      User Setup      |
    \---------------------*/

    /*--------------------\ 
    |        Table        |
    \--------------------*/

    describe('Table', () => {
        it('tables (POST)', async () => {
            const res = await request(app.getHttpServer())
                .post('/tables')
                .send(mockTable).expect(201)
            expect(res.body.tableNumber).toEqual(mockTable.tableNumber)
            expect(res.body.capacity).toEqual(mockTable.capacity)
            responseTable = res.body
            request(app.getHttpServer())
                .post('/tables')
                .send(mockTable).expect(409)
        })

        // Negative test
        it('tables (POST)', () => {
            const res = request(app.getHttpServer())
                .post('/tables')
                .send({ chicken: "chickennuggets" }).expect(400)
            return res
        })

        it('tables (GET)', async () => {
            const res = await request(app.getHttpServer())
                .get('/tables')
                .expect(200)
            expect(res.body.length).toBe(1)
            expect(res.body[0]._id).toBe(responseTable._id)
        })

        it('tables/:id (GET)', async () => {
            const res = await request(app.getHttpServer())
                .get(`/tables/${responseTable._id}`)
                .expect(200)
            expect(res.body).toEqual(responseTable)
        })

        // Negative test
        it('tables/:id (GET)', () => {
            const res = request(app.getHttpServer())
                .get(`/tables/${'6183bf0bac92df1094bd7caf'}`)
                .expect(404)
            return res
        })

        it('tables/:id (PATCH)', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/tables/${responseTable._id}`)
                .send({ tableNumber: "13", capacity: 3 })
                .expect(200)
            expect(res.body.tableNumber).toEqual("13")
        })

        // Negative test
        it('tables/:id (PATCH)', () => {
            const res = request(app.getHttpServer())
                .patch(`/tables/${'6183bf0bac92df1094bd7caf'}`)
                .send({ tableNumber: "13", capacity: 3 })
                .expect(404)
            return res
        })

        // Negative test
        it('tables/:id (PATCH)', () => {
            const res = request(app.getHttpServer())
                .patch(`/tables/${responseTable._id}`)
                .send({ chicken: 13 })
                .expect(400)
            return res
        })

        // Negative test
        it('tables/:id (DELETE)', () => {
            const res = request(app.getHttpServer())
                .delete(`/tables/${'6183bf0bac92df1094bd7caf'}`)
                .expect(404)
            return res
        })

        it('tables/:id (DELETE)', () => {
            const res = request(app.getHttpServer())
                .delete(`/tables/${responseTable._id}`)
                .expect(204)
            return res
        })

    })
})