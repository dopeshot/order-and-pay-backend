import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuSchema } from './entities/menu.entity';
import { MenuService } from './menu.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Menu', schema: MenuSchema }])
    ],
    providers: [MenuService],
    exports: [MenuService]
})
export class MenuModule {}
