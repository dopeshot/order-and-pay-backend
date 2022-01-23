import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { BulkDeleteTableDto } from './dto/bulkDelete-table.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TablesService } from './tables.service';
import { ResponseTable } from './types/response-table';

@ApiTags('tables')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller('tables')
export class TablesController {
    constructor(private readonly tableService: TablesService) {}

    @Post()
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new table' })
    async create(
        @Body() createTableDto: CreateTableDto
    ): Promise<ResponseTable> {
        return new ResponseTable(
            await this.tableService.create(createTableDto)
        );
    }

    @Get()
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new table' })
    async findAll(): Promise<ResponseTable[]> {
        const result: ResponseTable[] = (await this.tableService.findAll()).map(
            (table) => new ResponseTable(table)
        );
        return result;
    }

    @Get(':id')
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get information of one table via id' })
    async findOne(@Param() { id }: MongoIdDto): Promise<ResponseTable> {
        return new ResponseTable(await this.tableService.findOne(id));
    }

    @Patch(':id')
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Patch new information of one table via id' })
    async update(
        @Param() { id }: MongoIdDto,
        @Body() updateTableDto: UpdateTableDto
    ): Promise<ResponseTable> {
        return new ResponseTable(
            await this.tableService.update(id, updateTableDto)
        );
    }

    @Delete(':id')
    @HttpCode(204)
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete one table via id' })
    delete(@Param() { id }: MongoIdDto) {
        return this.tableService.delete(id);
    }

    @Delete('/bulk/delete')
    @HttpCode(204)
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete multiple tables' })
    bulkDelete(@Body() { ids }: BulkDeleteTableDto) {
        return this.tableService.bulkDelete(ids);
    }

    @Post('/migrate')
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete multiple tables' })
    migrate() {
        return this.tableService.migrate();
    }
}
