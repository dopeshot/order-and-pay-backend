import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, ValidationPipe, Put } from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/strategies/jwt/jwt-auth.guard';

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
  findOne(@Param('id') id: string) {
    return this.tableService.findOne(id);
  }

  @Patch(':id')
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Patch new information of one table via id' })
  update(@Param('id') id: string, @Body(new ValidationPipe({ whitelist: true })) updateTableDto: UpdateTableDto) {
    return this.tableService.update(id, updateTableDto);
  }

  @Delete(':id')
  @HttpCode(204)
  //@UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete one Table via id' })
  remove(@Param('id') id: string) {
    return this.tableService.remove(id);
  }
}
