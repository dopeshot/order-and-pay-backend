import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { join } from 'path';
import * as request from 'supertest';
import { QrCodesModule } from '../src/qr-codes/qr-codes.module';
import { TableDocument } from '../src/tables/entities/table.entity';
import { TablesModule } from '../src/tables/tables.module';
import {
    closeInMongodConnection,
    rootMongooseTestModule
} from './helpers/MongoMemoryHelpers';
import { getTablesSeeder } from './__mocks__/tables-mock-data';

describe('QrCodeController (e2e)', () => {
    let connection: Connection;
    let app: NestExpressApplication;
    let tableModel: Model<TableDocument>;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [rootMongooseTestModule(), TablesModule, QrCodesModule]
        }).compile();

        connection = await module.get(getConnectionToken());
        tableModel = connection.model('Table');
        app = module.createNestApplication<NestExpressApplication>();
        app.setBaseViewsDir(join(__dirname, '..', 'views'));
        app.setViewEngine('ejs');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await tableModel.insertMany(getTablesSeeder());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await tableModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('GET /qr-codes/:id', () => {
        it('should return a qr code', async () => {
            const table = await tableModel.findOne({});
            await request(app.getHttpServer())
                .get(`/qr-codes/${table._id}`)
                .expect(HttpStatus.OK);
        });

        it('should return a 404 if the table does not exist', async () => {
            await tableModel.deleteMany();
            await request(app.getHttpServer())
                .get('/qr-codes/' + getTablesSeeder()[0]._id)
                .expect(HttpStatus.NOT_FOUND);
        });

        it('should fail for invalid tableId', async () => {
            await tableModel.deleteMany();
            await request(app.getHttpServer())
                .get('/qr-codes/' + 'not-a-valid-id')
                .expect(HttpStatus.BAD_REQUEST);
        });
    });
});