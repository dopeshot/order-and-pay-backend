import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    SerializeOptions,
    UseInterceptors
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MenusService } from '../menus/menus.service';
import { PopulatedMenuResponse } from '../menus/responses/populated-menu.response';

@Controller('client')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class ClientController {
    constructor(private readonly menusService: MenusService) {}

    @Get('menu')
    @ApiOperation({ summary: 'Get currently active menu' })
    async getMenu() {
        return new PopulatedMenuResponse(
            await this.menusService.findAndPopulate(
                (
                    await this.menusService.findCurrent()
                )._id
            )
        );
    }
}
