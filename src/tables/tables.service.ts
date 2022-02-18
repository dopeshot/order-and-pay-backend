import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model, ObjectId } from 'mongoose';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableDocument } from './entities/table.entity';

@Injectable()
export class TablesService {
    private readonly logger = new Logger(TablesService.name);
    constructor(
        @InjectModel('Table') private readonly tableModel: Model<TableDocument>
    ) {}

    async create(createTableDto: CreateTableDto): Promise<TableDocument> {
        try {
            // This is currently of type any due to no other way to access the createdAt property
            const table = await this.tableModel.create(createTableDto);

            this.logger.debug(
                `The table (number = ${table.tableNumber}, id = ${table._id}) has been created successfully.`
            );
            return table.toObject() as TableDocument;
        } catch (error) {
            if (error.code == '11000') {
                this.logger.warn(
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
        const tables: TableDocument[] = await this.tableModel.find().lean();

        return tables;
    }

    async findOne(id: ObjectId): Promise<TableDocument> {
        const table: TableDocument = await this.tableModel.findById(id).lean();

        if (!table) {
            this.logger.debug(
                `A table (id = ${id}) was requested but could not be found.`
            );
            throw new NotFoundException();
        }

        return table;
    }

    async update(
        id: ObjectId,
        updateTableDto: UpdateTableDto
    ): Promise<TableDocument> {
        let table: TableDocument;
        try {
            table = await this.tableModel
                .findByIdAndUpdate(id, updateTableDto, {
                    new: true
                })
                .lean();
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
            this.logger.warn(
                `Updating table (id = ${id}) failed as it could not be found.`
            );
            throw new NotFoundException();
        }

        this.logger.debug(
            `The table (id = ${table._id}) has been updated successfully.`
        );
        return table;
    }

    async delete(id: ObjectId): Promise<void> {
        const table: TableDocument = await this.tableModel
            .findByIdAndDelete(id)
            .lean();

        if (!table) {
            this.logger.warn(
                `Deleting table (id = ${id}) failed as it could not be found.`
            );
            throw new NotFoundException();
        }

        this.logger.debug(
            `The table (id = ${id}) has been deleted successfully.`
        );

        return;
    }

    async bulkDelete(ids: string[]): Promise<void> {
        const deletes: DeleteResult = await this.tableModel.deleteMany({
            _id: { $in: ids }
        });
        if (deletes.deletedCount === 0) {
            this.logger.debug(
                `Bulk delete failed as no tables were deleted. (Check passed Id list)`
            );
            throw new NotFoundException();
        }
        // This is warn as it is something that could be dangerous
        this.logger.warn(
            `The tables (ids = ${ids}) have been deleted successfully.`
        );
    }
}
