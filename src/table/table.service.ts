import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableDocument } from './entities/table.entity';
import { ResponseTable } from './types/response';
import { DeleteResult, ObjectId } from 'mongodb';
import { getMigrateTables } from './sampleTables/migrateTables'

@Injectable()
export class TableService {
  constructor(
    @InjectModel('Table') private tableSchema: Model<TableDocument>
  ) { }

  async create(createTableDto: CreateTableDto): Promise<ResponseTable> {
    try {
      // This is currently of type any due to no other way to access the createdAt property
      const table: any = await this.tableSchema.create({ ...createTableDto })

      return this.convertToResponse(table)

    } catch (error) {
      if (error.code == '11000') {
        throw new ConflictException('This table number already exists')
      }
      throw error
    }

  }

  async findAll(): Promise<ResponseTable[]> {

    const tables: TableDocument[] = await this.tableSchema.find()
    const result: ResponseTable[] = []

    tables.forEach((table) => {
      result.push(this.convertToResponse(table))
    })

    return result

  }

  async findOne(id: string): Promise<ResponseTable> {

    const table: TableDocument = await this.tableSchema.findById(id)

    if (!table) {
      throw new NotFoundException()
    }

    return this.convertToResponse(table)

  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<ResponseTable> {
    try {
      const table: TableDocument = await this.tableSchema.findByIdAndUpdate(id, updateTableDto, { new: true })
      if (!table) {
        throw new NotFoundException()
      }

      return this.convertToResponse(table)
    } catch (error) {
      if (error.code == '11000') {
        throw new ConflictException('This table number already exists')
      }
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    const table: TableDocument = await this.tableSchema.findByIdAndDelete(id)

    if (!table) {
      throw new NotFoundException()
    }

    return

  }

  async bulkDelete(ids: string[]): Promise<void> {
    const deletes: DeleteResult = await this.tableSchema.deleteMany({ "_id": { $in: ids } })
    if (deletes.deletedCount === 0) {
      throw new NotFoundException()
    }
  }

  async migrate(): Promise<void> {
    await this.tableSchema.insertMany(getMigrateTables())
  }

  // Helper function
  private convertToResponse(table): ResponseTable {
    return {
      _id: table._id,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      updatedAt: table.updatedAt,
      author: table.author
    }
  }

}
