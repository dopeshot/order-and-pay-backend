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

  async create(createTableDto: CreateTableDto): Promise<ResponseTable> {
    try {
      // Can't be a const since the table is set in a trycatch
      let table: TableDocument;
      try {
        table = await this.tableSchema.create({ ...createTableDto })

      } catch (error) {
        throw new UnprocessableEntityException('This tableNumber is already taken')
      }

      return {
        _id: table._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity
      }

    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAll(): Promise<ResponseTable[]> {
    try {
      const tables: TableDocument[] = await this.tableSchema.find({}, { _id: 1, tableNumber: 1, capacity: 1 })

      return <ResponseTable[]>tables

    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async findOne(id: string): Promise<ResponseTable> {
    try {
      const table: TableDocument = await this.tableSchema.findById(id, { _id: 1, tableNumber: 1, capacity: 1 })

      if (!table) {
        throw new NotFoundException()
      }

      return <ResponseTable>table

    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    try {
      const table: TableDocument = await this.tableSchema.findByIdAndUpdate(id, updateTableDto)

      if (!table) {
        throw new NotFoundException()
      }

      // FindByIdAndUpdate returns the match, not the updated version, thus I will have to request a second time to view the new data
      const result = await this.tableSchema.findById(id, { _id: true, tableNumber: true, capacity: true })

      if (!result) {
        throw new UnprocessableEntityException()
      }

      // Casting here is fine since I already only request the parameters that are in type ResponseTable
      return <ResponseTable>result

    } catch (error) {
      console.log(error)
      throw error
    }

  }

  async remove(id: string) {
    try {
      const table: TableDocument = await this.tableSchema.findByIdAndDelete(id)

      if (!table) {
        throw new NotFoundException()
      }
      return

    } catch (error) {
      console.log(error)
      throw error
    }

  }
}
