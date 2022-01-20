import { Controller } from '@nestjs/common';
import { MenuService } from 'src/menu/menu.service';

@Controller('client')
export class ClientController {
    constructor(private readonly menuService: MenuService) {}
}
