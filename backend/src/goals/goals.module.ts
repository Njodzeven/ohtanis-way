import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { MandalaChart, MandalaChartSchema } from '../schemas/mandala-chart.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: MandalaChart.name, schema: MandalaChartSchema }]),
    ],
    controllers: [GoalsController],
    providers: [GoalsService],
})
export class GoalsModule { }
