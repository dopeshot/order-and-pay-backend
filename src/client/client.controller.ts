import { Controller } from '@nestjs/common';
import { MenuService } from '../menu/menu.service';

@Controller('client')
export class ClientController {
    constructor(private readonly menuService: MenusService) {}
}
