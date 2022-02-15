import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableDocument } from './entities/tables.entity';
import { getMigrateTables } from './sampleTables/migrateTables';

@Injectable()
export class TablesService {
    private readonly logger = new Logger(TablesService.name);
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
                this.logger.debug(
                    `Creating a table (number = ${createTableDto.tableNumber}) failed due to a conflict.`
                );
                throw new ConflictException('This table number already exists');
            }
            this.logger.error(
                `An error has occured while creating a new table (${error})`
            );
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
        let table: TableDocument;
        try {
            table = await this.tableModel.findByIdAndUpdate(
                id,
                updateTableDto,
                {
                    new: true
                }
            );
        } catch (error) {
            if (error.code == '11000') {
                this.logger.debug(
                    `Updating a table (number = ${updateTableDto.tableNumber}) failed due to a conflict.`
                );
                throw new ConflictException('This table number already exists');
            }
            this.logger.error(`Error while updating a table (${error})`);
            throw new InternalServerErrorException();
        }
        if (!table) {
            throw new NotFoundException();
        }

        return table;
    }

    async delete(id: string): Promise<void> {
        const table: TableDocument = await this.tableModel.findByIdAndDelete(
            id
        );

        if (!table) {
            throw new NotFoundException();
        }

        this.logger.debug(
            `The menu (id = ${id}) has been deleted successfully.`
        );

        return;
    }

    async bulkDelete(ids: string[]): Promise<void> {
        const deletes: DeleteResult = await this.tableModel.deleteMany({
            _id: { $in: ids }
        });
        if (deletes.deletedCount === 0) {
            throw new NotFoundException();
        }
        // This is warn as it is something that could be dangerous
        this.logger.warn(
            `The menus (ids = ${ids}) have been deleted successfully.`
        );
    }

    async migrate(): Promise<void> {
        this.logger.debug('Migrating tables...');
        await this.tableModel.insertMany(getMigrateTables());
    }
}
