import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { CreateMenuDto } from '../menu/dto/create-menu.dto';
import { UpdateMenuDto } from '../menu/dto/update-menu.dto';
import { MenuService } from '../menu/menu.service';
import { MenuResponse } from '../menu/responses/menu.responses';

@Controller('admin')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class AdminController {
    constructor(private readonly menuService: MenuService) {}

    @Get('/menus')
    async findAll(): Promise<MenuResponse[]> {
        return (await this.menuService.findAll()).map(
            (set) => new MenuResponse(set)
        );
    }

    @Post('/menus')
    async createNew(@Body() newMenu: CreateMenuDto): Promise<MenuResponse> {
        return new MenuResponse(await this.menuService.createMenu(newMenu));
    }

    @Patch('menus/:id')
    async updateMenu(
        @Body() updateMenuDto: UpdateMenuDto,
        @Param('id') id: ObjectId
    ): Promise<MenuResponse> {
        return new MenuResponse(
            await this.menuService.updateMenu(id, updateMenuDto)
        );
    }
}
