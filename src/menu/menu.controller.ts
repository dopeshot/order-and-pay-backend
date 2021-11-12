import { Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Menu } from "./entities/menu.entity";
import { MenuService } from "./menu.service";

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}
  
  @Get()
  async findAll(): Promise<Menu[]> {
    return await this.menuService.findAll();
  }

  @Get('/current')
  async findCurrent(): Promise<Menu> {
    return await this.menuService.findCurrent(await this.menuService.getCurrentTimestamp());
  }
}