import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AllergensController } from './allergens.controller';
import { AllergensService } from './allergens.service';
import { AllergenSchema } from './entities/allergen.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Allergen', schema: AllergenSchema }
        ])
    ],
    controllers: [AllergensController],
    providers: [AllergensService],
    exports: [AllergensService]
})
export class AllergensModule {}
