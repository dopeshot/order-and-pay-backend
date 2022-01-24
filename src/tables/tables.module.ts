import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TableSchema } from './entities/tables.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Table', schema: TableSchema }])
    ],
    controllers: [TablesController],
    providers: [TablesService],
    exports: [TablesService]
})
export class TablesModule {}
