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
import { CreateMenuDto } from '../menus/dto/create-menu.dto';
import { UpdateMenuDto } from '../menus/dto/update-menu.dto';
import { MenusService } from '../menus/menus.service';
import { MenuResponse } from '../menus/responses/menu.responses';
import { DeleteType } from './enums/delete-type.enum';

@Controller('admin')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@ApiTags('admin')
export class AdminController {
    constructor(private readonly menuService: MenusService) {}

    @Get('/menus')
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

    @Post('/menus')
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

    @Patch('menus/:id')
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

    @Delete('menus/:id')
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
