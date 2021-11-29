import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
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
      // This is currently of type any due to no other way to access the createdAt property
      const table: any = await this.tableSchema.create({...createTableDto})

      return this.convertToResponse(table)

    } catch (error) {
      if (error.code == '11000') {
        console.log("DUPLICATE WOOP WOOOP")
        throw new ConflictException('This table number already exists')
      }
      console.error(error)
      throw new InternalServerErrorException()
    }

  }

  async findAll(): Promise<ResponseTable[]> {

    const tables: TableDocument[] = await this.tableSchema.find({},)
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

    const table: TableDocument = await this.tableSchema.findByIdAndUpdate(id, updateTableDto, { new: true })

    if (!table) {
      throw new NotFoundException()
    }

    return this.convertToResponse(table)

  }

  async remove(id: string): Promise<void> {
    const table: TableDocument = await this.tableSchema.findByIdAndDelete(id)

    if (!table) {
      throw new NotFoundException()
    }

    return

  }

  convertToResponse(table): ResponseTable {
    return {
      _id: table._id,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      updatedAt: table.updatedAt,
      createdBy: table.createdBy
    }
  }

}
