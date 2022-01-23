import { Module } from '@nestjs/common';
import { MenusModule } from '../menu/menus.module';
import { AdminController } from './admin.controller';

@Module({
    controllers: [AdminController],
    imports: [MenusModule]
})
export class AdminModule {}
