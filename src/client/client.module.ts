import { Module } from '@nestjs/common';
import { MenuModule } from 'src/menu/menu.module';
import { ClientController } from './client.controller';

@Module({
    controllers: [ClientController],
    imports: [MenuModule]
})
export class ClientModule {}
