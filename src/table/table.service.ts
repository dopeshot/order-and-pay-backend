import {
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableDocument } from './entities/table.entity';
import { getMigrateTables } from './sampleTables/migrateTables';
import { ResponseTable } from './types/response-table';

@Injectable()
export class TableService {
    constructor(
        @InjectModel('Table') private tableSchema: Model<TableDocument>
    ) {}

    async create(createTableDto: CreateTableDto): Promise<TableDocument> {
        try {
            // This is currently of type any due to no other way to access the createdAt property
            const table: TableDocument = await this.tableSchema.create({
                ...createTableDto
            });
            return table;
        } catch (error) {
            if (error.code == '11000') {
                throw new ConflictException('This table number already exists');
            }
            throw error;
        }
    }

    async findAll(): Promise<TableDocument[]> {
        const tables: TableDocument[] = await this.tableSchema.find();

        return tables;
    }

    async findOne(id: string): Promise<TableDocument> {
        const table: TableDocument = await this.tableSchema.findById(id);

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
                await this.tableSchema.findByIdAndUpdate(id, updateTableDto, {
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
        const table: TableDocument = await this.tableSchema.findByIdAndDelete(
            id
        );

        if (!table) {
            throw new NotFoundException();
        }

        return;
    }

    async bulkDelete(ids: string[]): Promise<void> {
        const deletes: DeleteResult = await this.tableSchema.deleteMany({
            _id: { $in: ids }
        });
        if (deletes.deletedCount === 0) {
            throw new NotFoundException();
        }
    }

    async migrate(): Promise<void> {
        await this.tableSchema.insertMany(getMigrateTables());
    }
}
