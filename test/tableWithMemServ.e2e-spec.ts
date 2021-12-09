import { HttpCode, HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken, MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, ObjectId } from 'mongoose';
import { timeout } from 'rxjs';
import { ResponseTable } from 'src/table/types/response';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { closeInMongodConnection, rootMongooseTestModule } from './helpers/MongoMemoryHelpers';
import { MongoMemoryServer } from 'mongodb-memory-server';


describe('TableController (e2e)', () => {
    let app: INestApplication
    let mongod: MongoMemoryServer
    let responseTable: ResponseTable
    let wrongId = "6183bf0bac92df1094bd7caf"
    const mockTable = {
        tableNumber: "1",
        capacity: 4,
        createdBy: "12"
    }

    const rootMongooseTestModule = (options: MongooseModuleOptions = {}) => MongooseModule.forRootAsync({
        useFactory: async () => {
            mongod = await MongoMemoryServer.create();
            const mongoUri = await mongod.getUri();
            return {
                uri: mongoUri,
                ...options,
            }
        },
    });

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                AppModule, // Here the uri isnt changed!
            ],
            providers: []
        }).compile();
        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        //await connection.close()
        await mongod.stop()
    })

    /*---------------------\ 
    |      User Setup      |
    \---------------------*/

    /*--------------------\ 
    |        Table        |
    \--------------------*/


    it('tables (POST), create table', async () => {
        const res = await request(app.getHttpServer())
            .post('/tables')
            .send(mockTable).expect(HttpStatus.CREATED)
        expect(res.body.tableNumber).toEqual(mockTable.tableNumber)
        expect(res.body.capacity).toEqual(mockTable.capacity)
        responseTable = res.body
    })

})