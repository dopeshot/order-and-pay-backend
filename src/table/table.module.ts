import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TableSchema } from './entities/table.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Table', schema: TableSchema }])
  ],
  controllers: [TableController],
  providers: [TableService],
  exports: [TableService]
})
export class TableModule { }
