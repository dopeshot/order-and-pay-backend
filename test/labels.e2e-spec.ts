import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { TestingModule, Test } from "@nestjs/testing";
import { Connection, Model } from "mongoose";
import * as request from 'supertest';
import { Label, LabelDocument } from "../src/labels/entities/label.entity";
import { LabelsModule } from "../src/labels/labels.module";
import { rootMongooseTestModule, closeInMongodConnection } from "./helpers/MongoMemoryHelpers";
import { getStringOfLength, getSampleLabel, getLabelDBSeeder, getWrongId } from "./__mocks__/label-mock-data";

describe('LabelsController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;
    let labelModel: Model<LabelDocument>;
    const path = '/admin/labels'

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [rootMongooseTestModule(), LabelsModule]
        }).compile();

        connection = await module.get(getConnectionToken());
        labelModel = connection.model('Label');
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    // Insert test data
    beforeEach(async () => {
        await labelModel.insertMany(getLabelDBSeeder());
    });

    // Empty the collection from all possible impurities
    afterEach(async () => {
        await labelModel.deleteMany();
    });

    afterAll(async () => {
        await connection.close();
        closeInMongodConnection();
    });

    describe('Label', () => {
        describe('admin/labels (POST)', () => {
            it('should return one element of type Label', async () => {
                const res = await request(app.getHttpServer())
                .post(`${path}`)
                .send(getSampleLabel())
                .expect(HttpStatus.CREATED)

                const label = new Label(res.body)
                expect(res.body).toMatchObject(label)

                expect(res.body.title).toBe(getSampleLabel().title)
                expect(res.body.icon).toBe(getSampleLabel().icon)
            })

            it('should return CREATED with only title', async () => {
                await request(app.getHttpServer())
                .post(`${path}`)
                .send({title: "aaaaaaaa"})
                .expect(HttpStatus.CREATED)
            })

            it('should return BAD_REQUEST without title', async () => {
                await request(app.getHttpServer())
                .post(`${path}`)
                .send({icon: "aaaaaaaa"})
                .expect(HttpStatus.BAD_REQUEST)
            })

            it('should return BAD_REQUEST with too short title', async () => {
                await request(app.getHttpServer())
                .post(`${path}`)
                .send({title: ""})
                .expect(HttpStatus.BAD_REQUEST)
            })

            it('should return BAD_REQUEST with too long title', async () => {
                await request(app.getHttpServer())
                .post(`${path}`)
                .send({title: getStringOfLength(21)})
                .expect(HttpStatus.BAD_REQUEST)
            })

            it('should return BAD_REQUEST with too short icon', async () => {
                await request(app.getHttpServer())
                .post(`${path}`)
                .send({title: "normal", icon: ""})
                .expect(HttpStatus.BAD_REQUEST)
            })

            it('should return BAD_REQUEST with too long icon', async () => {
                await request(app.getHttpServer())
                .post(`${path}`)
                .send({title: "normal", icon: getStringOfLength(51)})
                .expect(HttpStatus.BAD_REQUEST)
            })

            it('should return BAD_REQUEST with wrong dto', async () => {
                await request(app.getHttpServer())
                .post(`${path}`)
                .send({wrongparam: "aaaaaaaa"})
                .expect(HttpStatus.BAD_REQUEST)
            })

            it('should return BAD_REQUEST without data', async () => {
                await request(app.getHttpServer())
                .post(`${path}`)
                .expect(HttpStatus.BAD_REQUEST)
            })   

            it('should return CONFLICT with duplicate title', async () => {
                await request(app.getHttpServer())
                .post(`${path}`)
                .send({title: getLabelDBSeeder().title})
                .expect(HttpStatus.CONFLICT)
            })   
        })

        describe('admin/labels (GET)', () => {
            it('should return an array with 1 element', async () => {
                const res = await request(app.getHttpServer())
                .get(`${path}`)
                .expect(HttpStatus.OK)

                expect(res.body).toHaveLength(1)
                const label = new Label(res.body[0])
                expect(res.body[0]).toMatchObject(label)
            })
            it('should return an empty array if database is empty', async () => {
                await labelModel.deleteMany()
                const res = await request(app.getHttpServer())
                .get(`${path}`)
                .expect(HttpStatus.OK)

                expect(res.body).toHaveLength(0)
            })
        })

        describe('admin/labels/:id (GET)', () => {
            it('should return one element of type Label', async () => {
                const res = await request(app.getHttpServer())
                .get(`${path}/${getLabelDBSeeder()._id}`)
                .expect(HttpStatus.OK)

                const label = new Label(res.body)
                expect(res.body).toMatchObject(label)
            })

            it('should return NOT_FOUND', async () => {
                await request(app.getHttpServer())
                .get(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND)
            })
        })

        describe('admin/labels/:id/refs (GET): TODO: FIX AFTER DISHES IMPLEMENTED', () => {
            it('should return one element of type Label', async () => {
                const res = await request(app.getHttpServer())
                .get(`${path}/${getLabelDBSeeder()._id}/refs`)
                .expect(HttpStatus.NOT_IMPLEMENTED)

                // const label = new Label(res.body)
                // expect(res.body).toMatchObject(label)
            })

            // it('should return empty array', async () => {
            //     const res = await request(app.getHttpServer())
            //     .get(`${path}/${wrongId()}`)
            //     .expect(HttpStatus.OK)
                
            //     expect(res.body).toHaveLength(0)
            // })
        })

        describe('admin/labels/:id (PATCH)', () => {
            it('should return one element of type Label with both updates', async () => {
                const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelDBSeeder()._id}`)
                .send({title: "New Title", icon: "New Icon"})
                .expect(HttpStatus.OK)

                const label = new Label(res.body)
                expect(res.body).toMatchObject(label)
                expect(res.body.title).toBe("New Title")
                expect(res.body.icon).toBe("New Icon")
            })

            it('should return one element of type Label with title update', async () => {
                const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelDBSeeder()._id}`)
                .send({title: "New Title"})
                .expect(HttpStatus.OK)

                expect(res.body.title).toBe("New Title")
            })

            it('should return one element of type Label with icon update', async () => {
                const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelDBSeeder()._id}`)
                .send({icon: "New Icon"})
                .expect(HttpStatus.OK)

                expect(res.body.icon).toBe("New Icon")
            })

            it('should return OK without data', async () => {
                const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelDBSeeder()._id}`)
                .expect(HttpStatus.OK)

                // Expect unchanged Object
                expect(res.body.title).toBe(getLabelDBSeeder().title)
                expect(res.body.icon).toBe(getLabelDBSeeder().icon)
            })

            it('should return OK with wrong param', async () => {
                const res = await request(app.getHttpServer())
                .patch(`${path}/${getLabelDBSeeder()._id}`)
                .send({wrongparam: "something"})
                .expect(HttpStatus.OK)

                // Expect unchanged Object
                expect(res.body.title).toBe(getLabelDBSeeder().title)
                expect(res.body.icon).toBe(getLabelDBSeeder().icon)
            })

            it('should return BAD_REQUEST with wrong param', async () => {
                await request(app.getHttpServer())
                .patch(`${path}/${getWrongId()}`)
                .send({wrongparam: "something"})
                .expect(HttpStatus.NOT_FOUND)
            })
        })

        describe('admin/labels/:id (DELETE)', () => {
            it('should return NO_CONTENT and delete the label',async ()=> {
                await request(app.getHttpServer())
                .delete(`${path}/${getLabelDBSeeder()._id}`)
                .expect(HttpStatus.NO_CONTENT)
                
                expect(await labelModel.find()).toHaveLength(0)
            })

            it('should return',async ()=> {
                await request(app.getHttpServer())
                .delete(`${path}/${getWrongId()}`)
                .expect(HttpStatus.NOT_FOUND)
            })
        })
    })
})