import { Module } from '@nestjs/common';
import { MenuModule } from '../menu/menu.module';
import { AdminController } from './admin.controller';

@Module({
    controllers: [AdminController],
    imports: [MenuModule]
})
export class AdminModule {}
