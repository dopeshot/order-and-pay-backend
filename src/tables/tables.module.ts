import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableSchema } from './entities/table.entity';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Table', schema: TableSchema }])
    ],
    controllers: [TablesController],
    providers: [TablesService],
    exports: [TablesService]
})
export class TablesModule {}
