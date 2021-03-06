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
import { plainToClass } from 'class-transformer';
import { Category } from '../categories/entities/category.entity';
import { DeleteType } from '../shared/enums/delete-type.enum';
import { MongoIdDto } from '../shared/global-validation/mongoId.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuPopulated } from './entities/menu.entity';
import { MenusService } from './menus.service';

@ApiTags('menus')
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
        type: Menu,
        isArray: true
    })
    async findAll(): Promise<Menu[]> {
        return plainToClass(Menu, await this.menuService.findAll());
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get one menu (simple form)', tags: ['menus'] })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The menu has been found',
        type: Menu
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No menu with this id found'
    })
    async findOne(@Param() { id }: MongoIdDto): Promise<Menu> {
        return plainToClass(Menu, await this.menuService.findOne(id));
    }

    @ApiOperation({
        summary: 'Get all categories that ref to this menu',
        tags: ['menus']
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The categories referencing the menu',
        type: Category,
        isArray: true
    })
    @Get(':id/refs')
    async findRefs(@Param() { id }: MongoIdDto) {
        return plainToClass(
            Category,
            await this.menuService.findCategories(id)
        );
    }

    @Get(':id/editor')
    @ApiOperation({
        summary: 'Get one Menu in populated form',
        tags: ['menus']
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Menu successfully populated with categories and dishes',
        type: Menu,
        isArray: true
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'No menu with this id found'
    })
    async findEditorView(@Param() { id }: MongoIdDto) {
        return plainToClass(
            MenuPopulated,
            await this.menuService.findAndPopulate(id)
        );
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
        return plainToClass(Menu, await this.menuService.createMenu(newMenu));
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Patch a menu', tags: ['menus'] })
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
        @Param() { id }: MongoIdDto
    ): Promise<Menu> {
        return plainToClass(
            Menu,
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
        @Param() { id }: MongoIdDto,
        @Query('type') type: DeleteType
    ): Promise<void> {
        await this.menuService.deleteMenu(id, type);
    }
}
