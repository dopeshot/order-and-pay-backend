import { Controller } from '@nestjs/common';
import { MenusService } from 'src/menu/menus.service';

@Controller('client')
export class ClientController {
    constructor(private readonly menuService: MenusService) {}
}
