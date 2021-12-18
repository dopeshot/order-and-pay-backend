import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MongoIdDto } from '../_globalValidation/mongoId.dto';
import { BulkDeleteTableDto } from './dto/bulkDelete-table.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableService } from './table.service';

@ApiTags('tables')
@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) { }

  @Post()
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new table' })
  create(
    @Body() createTableDto: CreateTableDto) {
    return this.tableService.create(createTableDto);
  }

  @Get()
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new table' })
  findAll() {
    return this.tableService.findAll();
  }

  @Get(':id')
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get information of one table via id' })
  findOne(
    @Param() { id }: MongoIdDto) {
    return this.tableService.findOne(id);
  }

  @Patch(':id')
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Patch new information of one table via id' })
  update(
    @Param() { id }: MongoIdDto,
    @Body() updateTableDto: UpdateTableDto) {
    return this.tableService.update(id, updateTableDto);
  }

  @Delete(':id')
  @HttpCode(204)
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete one table via id' })
  delete(
    @Param() { id }: MongoIdDto) {
    return this.tableService.delete(id);
  }

  @Delete('/bulk/delete')
  @HttpCode(204)
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete multiple tables' })
  bulkDelete(
    @Body() { ids }: BulkDeleteTableDto) {
    return this.tableService.bulkDelete(ids);
  }

  @Post('/migrate')
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete multiple tables' })
  migrate() {
    return this.tableService.migrate();
  }
}
