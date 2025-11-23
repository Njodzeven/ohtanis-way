import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MandalaChart, MandalaChartDocument } from '../schemas/mandala-chart.schema';

@Injectable()
export class GoalsService {
    constructor(
        @InjectModel(MandalaChart.name) private mandalaChartModel: Model<MandalaChartDocument>,
    ) { }

    async getChart(userId: string) {
        const chart = await this.mandalaChartModel.findOne({ userId }).exec();
        if (!chart) {
            // Return a default empty structure if not found
            return this.createDefaultChart(userId);
        }
        return chart;
    }

    async updateChart(userId: string, data: Partial<MandalaChart>) {
        return this.mandalaChartModel.findOneAndUpdate(
            { userId },
            { ...data, userId }, // Ensure userId is preserved
            { new: true, upsert: true, setDefaultsOnInsert: true },
        ).exec();
    }

    private createDefaultChart(userId: string) {
        return {
            userId,
            center: { id: 'center', content: '' },
            pillars: Array.from({ length: 8 }).map((_, i) => ({
                id: `pillar-${i}`,
                content: '',
                tasks: Array.from({ length: 8 }).map((_, j) => ({
                    id: `pillar-${i}-task-${j}`,
                    content: ''
                }))
            }))
        };
    }
}
