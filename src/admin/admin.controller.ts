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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { CreateMenuDto } from '../menu/dto/create-menu.dto';
import { UpdateMenuDto } from '../menu/dto/update-menu.dto';
import { MenuService } from '../menu/menu.service';
import { MenuResponse } from '../menu/responses/menu.responses';
import { DeleteType } from './enums/delete-type.enum';

@Controller('admin')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@ApiTags('admin')
export class AdminController {
    constructor(private readonly menuService: MenuService) {}

    @Get('/menus')
    @ApiOperation({ summary: 'Get all menus (simple form)', tags: ['menus'] })
    @ApiResponse({
        status: 200,
        description: 'The menu has been updated',
        type: [MenuResponse]
    })
    async findAll(): Promise<MenuResponse[]> {
        return (await this.menuService.findAll()).map(
            (set) => new MenuResponse(set)
        );
    }

    @Post('/menus')
    @ApiOperation({ summary: 'Create new menu', tags: ['menus'] })
    @ApiResponse({
        status: 200,
        description: 'The menu has been created',
        type: MenuResponse
    })
    @ApiResponse({
        status: 400,
        description: 'The provided update data was invalid'
    })
    @ApiResponse({
        status: 409,
        description: 'There is a conflict with an existing menu'
    })
    async createNew(@Body() newMenu: CreateMenuDto): Promise<MenuResponse> {
        return new MenuResponse(await this.menuService.createMenu(newMenu));
    }

    @Patch('menus/:id')
    @ApiOperation({ summary: 'Update existing menu', tags: ['menus'] })
    @ApiResponse({
        status: 200,
        description: 'The menu has been updated',
        type: MenuResponse
    })
    @ApiResponse({ status: 404, description: 'No menu with this id found' })
    @ApiResponse({
        status: 400,
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

    @Delete('menus/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a menu', tags: ['menus'] })
    @ApiResponse({ status: 204, description: 'The menu has been deleted' })
    @ApiResponse({ status: 404, description: 'No menu with this id exists' })
    async deleteMenu(
        @Param('id') id: ObjectId,
        @Query('type') type: DeleteType
    ): Promise<void> {
        return await this.menuService.deleteMenu(id, type);
    }
}
