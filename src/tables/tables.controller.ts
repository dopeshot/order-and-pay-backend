import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { BulkDeleteTableDto } from './dto/bulkDelete-table.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Table } from './entities/table.entity';
import { TablesService } from './tables.service';

@ApiTags('tables')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('tables')
export class TablesController {
    constructor(private readonly tableService: TablesService) {}

    @ApiOperation({ summary: 'Post a table', tags: ['tables'] })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The table has been created',
        type: Table
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'The table title already exists'
    })
    @Post()
    async create(@Body() createTableDto: CreateTableDto): Promise<Table> {
        return plainToClass(
            Table,
            await this.tableService.create(createTableDto)
        );
    }

    @ApiOperation({ summary: 'Get all tables', tags: ['tables'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The tables available in the database',
        type: Table,
        isArray: true
    })
    @Get()
    async findAll(): Promise<Table[]> {
        return plainToClass(Table, await this.tableService.findAll());
    }

    @ApiOperation({ summary: 'Get one table', tags: ['tables'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The table has been found',
        type: Table
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The table could not be found'
    })
    @Get(':id')
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get information of one table via id' })
    async findOne(@Param() { id }: MongoIdDto): Promise<Table> {
        return plainToClass(Table, await this.tableService.findOne(id));
    }

    @ApiOperation({ summary: 'Patch a table', tags: ['tables'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The table has been updated',
        type: Table
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'The table could not be found'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'The table title already exists'
    })
    @Patch(':id')
    async update(
        @Param() { id }: MongoIdDto,
        @Body() updateTableDto: UpdateTableDto
    ): Promise<Table> {
        return plainToClass(
            Table,
            await this.tableService.update(id, updateTableDto)
        );
    }

    @ApiOperation({ summary: 'Delete a table', tags: ['tables'] })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'The table has been deleted'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No table with this id exists'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    delete(@Param() { id }: MongoIdDto) {
        return this.tableService.delete(id);
    }

    @ApiOperation({ summary: 'Delete multiple tables', tags: ['tables'] })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'The tables have been deleted'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No tables were deleted'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/bulk/delete')
    bulkDelete(@Body() { ids }: BulkDeleteTableDto) {
        return this.tableService.bulkDelete(ids);
    }

    @Post('/migrate')
    //@UseGuards(JwtAuthGuard) TODO: Maybe even envGuard
    @ApiOperation({ summary: 'Create multiple tables' })
    migrate() {
        return this.tableService.migrate();
    }
}
