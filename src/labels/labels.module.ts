import { Module } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LabelSchema } from './entities/label.entity';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Label', schema: LabelSchema }])
    ],
    controllers: [LabelsController],
    providers: [LabelsService],
    exports: [LabelsService]
})
export class LabelsModule {}
