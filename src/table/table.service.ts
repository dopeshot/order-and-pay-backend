import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableDocument } from './entities/table.entity';
import { ResponseTable } from './types/response';

@Injectable()
export class TableService {
  constructor(
    @InjectModel('Table') private tableSchema: Model<TableDocument>
  ) { }

  // Object to insert in db requests as select Object
  responseTableSelect = { _id: 1, tableNumber: 1, capacity: 1 }

  tableDocumentToResponseTableConverter(table: TableDocument): ResponseTable {
    return {
      _id: table._id,
      tableNumber: table.tableNumber,
      capacity: table.capacity
    }
  }

  async create(createTableDto: CreateTableDto): Promise<ResponseTable> {
    try {
      const table: TableDocument = await this.tableSchema.create({ ...createTableDto })

      return this.tableDocumentToResponseTableConverter(table)

    } catch (error) {
      if (error.code = '11000') {
        throw new UnprocessableEntityException('This table number already exists')
      }
      throw error
    }
  }

  async findAll(): Promise<ResponseTable[]> {
    try {
      const tables: TableDocument[] = await this.tableSchema.find({}, this.responseTableSelect)
      const result: ResponseTable[] = []

      tables.forEach((table) => {
        result.push(this.tableDocumentToResponseTableConverter(table))
      })

      return result

    } catch (error) {
      throw error
    }

  }

  async findOne(id: string): Promise<ResponseTable> {
    try {
      const table: TableDocument = await this.tableSchema.findById(id, this.responseTableSelect)

      if (!table) {
        throw new NotFoundException()
      }

      return this.tableDocumentToResponseTableConverter(table)

    } catch (error) {
      throw error
    }

  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<ResponseTable> {
    try {
      const table: TableDocument = await this.tableSchema.findByIdAndUpdate(id, updateTableDto, { new: true }).select(['_id', 'tableNumber', 'capacity'])

      if (!table) {
        throw new NotFoundException()
      }

      return this.tableDocumentToResponseTableConverter(table)

    } catch (error) {
      throw error
    }

  }

  async remove(id: string): Promise<void> {
    try {
      const table: TableDocument = await this.tableSchema.findByIdAndDelete(id)

      if (!table) {
        throw new NotFoundException()
      }
      return

    } catch (error) {
      throw error
    }

  }

}
