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
import { Category } from '../categories/entities/category.entity';
import { DeleteType } from '../shared/enums/delete-type.enum';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuPopulated } from './entities/menu.entity';
import { MenusService } from './menus.service';

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
        type: [Menu]
    })
    async findAll(): Promise<Menu[]> {
        return (await this.menuService.findAll()).map((set) => new Menu(set));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get all menus (simple form)', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The menu has been updated',
        type: [Menu]
    })
    async findOne(@Param() { id }: MongoIdDto): Promise<Menu> {
        return new Menu(await this.menuService.findOne(id));
    }

    @ApiOperation({
        summary: 'Get all categories that ref to this menu',
        tags: ['menus']
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The dishes referencing the label',
        type: Category,
        isArray: true
    })
    @Get(':id/refs')
    async findRefs(@Param() { id }: MongoIdDto) {
        return (await this.menuService.findCategories(id)).map(
            (category) => new Category(category)
        );
    }

    @Get(':id/editor')
    @ApiOperation({
        summary: 'Get one Menu in populated form)',
        tags: ['menus']
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Menu successfully populated with categories and dishes',
        type: [Menu]
    })
    async findEditorView(@Param() { id }: MongoIdDto) {
        return new MenuPopulated(await this.menuService.findAndPopulate(id));
    }

    @Post()
    @ApiOperation({ summary: 'Create new menu', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The menu has been created',
        type: Menu
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'The provided update data was invalid'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'There is a conflict with an existing menu'
    })
    async createNew(@Body() newMenu: CreateMenuDto): Promise<Menu> {
        return new Menu(await this.menuService.createMenu(newMenu));
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update existing menu', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The menu has been updated',
        type: Menu
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
    ): Promise<Menu> {
        return new Menu(await this.menuService.updateMenu(id, updateMenuDto));
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
