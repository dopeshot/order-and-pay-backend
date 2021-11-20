import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuSchema } from './entities/menu.entity';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';


@Module({
    imports: [ MongooseModule.forFeature([{ name: 'Menu', schema: MenuSchema }]) ],
    controllers: [ MenuController],
    providers: [ MenuService],
    exports: [] 
})
export class MenuModule {}
