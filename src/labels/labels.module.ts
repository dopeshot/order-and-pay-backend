import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DishesModule } from '../dishes/dishes.module';
import { LabelSchema } from './entities/label.entity';
import { LabelsController } from './labels.controller';
import { LabelsService } from './labels.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Label', schema: LabelSchema }]),
        DishesModule
    ],
    controllers: [LabelsController],
    providers: [LabelsService],
    exports: [LabelsService]
})
export class LabelsModule {}
