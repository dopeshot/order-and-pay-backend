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
    Query,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { DeleteType } from '../shared/enums/delete-type.enum';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenusService } from './menus.service';
import { MenuResponse } from './responses/menu.responses';
import { PopulatedMenuResponse } from './responses/populated-menu.response';

@Controller('menus')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class MenusController {
    constructor(private readonly menuService: MenusService) {}

    @Get()
    @ApiOperation({ summary: 'Get all menus (simple form)', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The menu has been updated',
        type: [MenuResponse]
    })
    async findAll(): Promise<MenuResponse[]> {
        return (await this.menuService.findAll()).map(
            (set) => new MenuResponse(set)
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get all menus (simple form)', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The menu has been updated',
        type: [MenuResponse]
    })
    async findOne(@Param() { id }: MongoIdDto): Promise<MenuResponse> {
        return new MenuResponse(await this.menuService.findOne(id));
    }

    @Get(':id/editor')
    @ApiOperation({ summary: 'Get all menus (simple form)', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description:
            'You got your Menu, now leave me alone, I have no idea what this even does',
        type: [MenuResponse]
    })
    // Any because how do you even serialize something like this
    async findEditorView(@Param() { id }: MongoIdDto) {
        return new PopulatedMenuResponse(
            await this.menuService.findAndPopulate(id)
        );
    }

    @Post()
    @ApiOperation({ summary: 'Create new menu', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The menu has been created',
        type: MenuResponse
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'The provided update data was invalid'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'There is a conflict with an existing menu'
    })
    async createNew(@Body() newMenu: CreateMenuDto): Promise<MenuResponse> {
        return new MenuResponse(await this.menuService.createMenu(newMenu));
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update existing menu', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The menu has been updated',
        type: MenuResponse
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No menu with this id found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'The provided update data was invalid'
    })
    async updateMenu(
        @Body() updateMenuDto: UpdateMenuDto,
        @Param('id') id: ObjectId
    ): Promise<MenuResponse> {
        return new MenuResponse(
            await this.menuService.updateMenu(id, updateMenuDto)
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a menu', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'The menu has been deleted'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No menu with this id exists'
    })
    async deleteMenu(
        @Param('id') id: ObjectId,
        @Query('type') type: DeleteType
    ): Promise<void> {
        return await this.menuService.deleteMenu(id, type);
    }
}
