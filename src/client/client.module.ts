import { Module } from '@nestjs/common';
import { MenusModule } from 'src/menu/menus.module';
import { ClientController } from './client.controller';

@Module({
    controllers: [ClientController],
    imports: [MenusModule]
})
export class ClientModule {}
