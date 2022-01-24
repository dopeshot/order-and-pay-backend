import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableDocument } from './entities/tables.entity';
import { getMigrateTables } from './sampleTables/migrateTables';
import { ResponseTable } from './types/response-table';

@Injectable()
export class TablesService {
    constructor(
        @InjectModel('Table') private readonly tableModel: Model<TableDocument>
    ) {}

    async create(createTableDto: CreateTableDto): Promise<TableDocument> {
        try {
            // This is currently of type any due to no other way to access the createdAt property
            const table: TableDocument = await this.tableModel.create(
                createTableDto
            );
            return table;
        } catch (error) {
            if (error.code == '11000') {
                throw new ConflictException('This table number already exists');
            }
            /* istanbul ignore next */
            throw new InternalServerErrorException();
        }
    }

    async findAll(): Promise<TableDocument[]> {
        const tables: TableDocument[] = await this.tableModel.find();

        return tables;
    }

    async findOne(id: string): Promise<TableDocument> {
        const table: TableDocument = await this.tableModel.findById(id);

        if (!table) {
            throw new NotFoundException();
        }

        return table;
    }

    async update(
        id: string,
        updateTableDto: UpdateTableDto
    ): Promise<TableDocument> {
        try {
            const table: TableDocument =
                await this.tableModel.findByIdAndUpdate(id, updateTableDto, {
                    new: true
                });
            if (!table) {
                throw new NotFoundException();
            }

            return table;
        } catch (error) {
            if (error.code == '11000') {
                throw new ConflictException('This table number already exists');
            }
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        const table: TableDocument = await this.tableModel.findByIdAndDelete(
            id
        );

        if (!table) {
            throw new NotFoundException();
        }

        return;
    }

    async bulkDelete(ids: string[]): Promise<void> {
        const deletes: DeleteResult = await this.tableModel.deleteMany({
            _id: { $in: ids }
        });
        if (deletes.deletedCount === 0) {
            throw new NotFoundException();
        }
    }

    async migrate(): Promise<void> {
        await this.tableModel.insertMany(getMigrateTables());
    }
}
