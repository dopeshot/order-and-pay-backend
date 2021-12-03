import { HttpCode, HttpStatus, INestApplication } from '@nestjs/common';
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
    let wrongId = "6183bf0bac92df1094bd7caf"
    const mockTable = {
        tableNumber: "1",
        capacity: 4,
        createdBy: "12"
    }

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        connection = await moduleFixture.get(getConnectionToken());
        await connection.dropDatabase()

        app = moduleFixture.createNestApplication();
        await app.init();


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
        it('tables (POST), create table', async () => {
            const res = await request(app.getHttpServer())
                .post('/tables')
                .send(mockTable).expect(HttpStatus.CREATED)
            expect(res.body.tableNumber).toEqual(mockTable.tableNumber)
            expect(res.body.capacity).toEqual(mockTable.capacity)
            responseTable = res.body
        })

        // Negative test
        it('tables (POST), duplicate tableNumber', async () => {
            await request(app.getHttpServer())
                .post('/tables')
                .send(mockTable).expect(HttpStatus.CONFLICT)
        })

        // Negative test
        it('tables (POST), not matching property', async () => {
            await request(app.getHttpServer())
                .post('/tables')
                .send({ chicken: "chickennuggets" }).expect(HttpStatus.BAD_REQUEST)
        })

        it('tables (GET), table amounts', async () => {
            const res = await request(app.getHttpServer())
                .get('/tables')
                .expect(HttpStatus.OK)
            expect(res.body.length).toBe(1)
            expect(res.body[0]._id).toBe(responseTable._id)
        })

        it('tables/:id (GET), correct data received', async () => {
            const res = await request(app.getHttpServer())
                .get(`/tables/${responseTable._id}`)
                .expect(HttpStatus.OK)
            expect(res.body).toEqual(responseTable)
        })

        // Negative test
        it('tables/:id (GET), wrong Id', async () => {
            await request(app.getHttpServer())
                .get(`/tables/${wrongId}`)
                .expect(HttpStatus.NOT_FOUND)
        })

        it('tables/:id (PATCH), correct patch', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/tables/${responseTable._id}`)
                .send({ tableNumber: "13", capacity: 3 })
                .expect(HttpStatus.OK)
            expect(res.body.tableNumber).toEqual("13")
        })

        it('tables (POST,PATCH), patch duplicate tableNumber', async () => {
            const res = await request(app.getHttpServer())
                .post('/tables')
                .send({
                    tableNumber: "1",
                    capacity: 4,
                    createdBy: "12"
                }).expect(HttpStatus.CREATED)
            await request(app.getHttpServer())
                .patch(`/tables/${res.body._id}`)
                .send({
                    tableNumber: "13",
                    capacity: 4
                }).expect(HttpStatus.CONFLICT)
            await request(app.getHttpServer())
                .delete(`/tables/${res.body._id}`)
                .expect(HttpStatus.NO_CONTENT)
        })

        // Negative test
        it('tables/:id (PATCH), wrong Id', async () => {
            await request(app.getHttpServer())
                .patch(`/tables/${wrongId}`)
                .send({ tableNumber: "13", capacity: 3 })
                .expect(HttpStatus.NOT_FOUND)
        })

        // Negative test
        it('tables/:id (PATCH): capacity: null', async () => {
            await request(app.getHttpServer())
                .patch(`/tables/${wrongId}`)
                .send({ tableNumber: "13", capacity: null })
                .expect(HttpStatus.BAD_REQUEST)
        })

        // Negative test
        it('tables/:id (PATCH): capacity: negative', async () => {
            await request(app.getHttpServer())
                .patch(`/tables/${wrongId}`)
                .send({ tableNumber: "13", capacity: -1 })
                .expect(HttpStatus.BAD_REQUEST)
        })

        // Negative test
        it('tables/:id (PATCH), tablenumber: number', async () => {
            await request(app.getHttpServer())
                .patch(`/tables/${wrongId}`)
                .send({ tableNumber: 13, capacity: 1 })
                .expect(HttpStatus.BAD_REQUEST)
        })

        // Negative test
        it('tables/:id (PATCH), capacity: missing', async () => {
            await request(app.getHttpServer())
                .patch(`/tables/${wrongId}`)
                .send({ tableNumber: 13 })
                .expect(HttpStatus.BAD_REQUEST)
        })

        // Negative test
        it('tables/:id (PATCH), wrong property', async () => {
            await request(app.getHttpServer())
                .patch(`/tables/${responseTable._id}`)
                .send({ chicken: 13 })
                .expect(HttpStatus.BAD_REQUEST)
        })

        // Negative test
        it('tables/:id (DELETE), wrong Id', async () => {
            await request(app.getHttpServer())
                .delete(`/tables/${wrongId}`)
                .expect(HttpStatus.NOT_FOUND)
        })

        it('tables/:id (DELETE), delete table', async () => {
            await request(app.getHttpServer())
                .delete(`/tables/${responseTable._id}`)
                .expect(HttpStatus.NO_CONTENT)
        })

    })
})