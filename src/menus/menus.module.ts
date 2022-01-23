import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuSchema } from './entities/menu.entity';
import { MenusService } from './menus.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Menu', schema: MenuSchema }])
    ],
    providers: [MenusService],
    exports: [MenusService]
})
export class MenusModule {}
