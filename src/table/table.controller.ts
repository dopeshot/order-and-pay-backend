import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidateMongoId } from '../_globalValidation/mongoId-validation';
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
  @ApiOperation({ summary: 'Create a new Table' })
  create(
    @Body(new ValidationPipe({ whitelist: true })) createTableDto: CreateTableDto) {
    return this.tableService.create(createTableDto);
  }

  @Get()
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new Table' })
  findAll() {
    return this.tableService.findAll();
  }

  @Get(':id')
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get information of one Table via id' })
  findOne(
    @Param('id', ValidateMongoId) id: string) {
    return this.tableService.findOne(id);
  }

  @Patch(':id')
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Patch new information of one Table via id' })
  update(
    @Param('id', ValidateMongoId) id: string,
    @Body(new ValidationPipe({ whitelist: true })) updateTableDto: UpdateTableDto) {
    return this.tableService.update(id, updateTableDto);
  }

  @Delete(':id')
  @HttpCode(204)
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete one Table via id' })
  delete(
    @Param('id', ValidateMongoId) id: string) {
    return this.tableService.delete(id);
  }

  @Delete('/bulk/delete')
  @HttpCode(204)
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete multiple Tables' })
  bulkDelete(
    @Body(new ValidationPipe({ whitelist: true })) ids: BulkDeleteTableDto) {
    return this.tableService.bulkDelete(ids.ids);
  }
}
