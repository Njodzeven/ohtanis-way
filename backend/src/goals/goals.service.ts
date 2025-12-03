import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MandalaChart, MandalaChartDocument } from '../schemas/mandala-chart.schema';

@Injectable()
export class GoalsService {
    constructor(
        @InjectModel(MandalaChart.name) private mandalaChartModel: Model<MandalaChartDocument>,
    ) { }

    /**
     * Sanitize and validate userId to prevent NoSQL injection
     */
    private sanitizeUserId(userId: string): string {
        if (!userId || typeof userId !== 'string') {
            throw new BadRequestException('Invalid user ID');
        }
        // Ensure userId is a clean string, not an object or array
        return userId.toString().trim();
    }

    async getChart(userId: string) {
        const sanitizedId = this.sanitizeUserId(userId);
        const chart = await this.mandalaChartModel.findOne({ userId: sanitizedId }).exec();
        if (!chart) {
            // Return a default empty structure if not found
            return this.createDefaultChart(userId);
        }
        return chart;
    }

    async updateChart(userId: string, data: Partial<MandalaChart>) {
        const sanitizedId = this.sanitizeUserId(userId);
        return this.mandalaChartModel.findOneAndUpdate(
            { userId: sanitizedId },
            { ...data, userId: sanitizedId }, // Ensure userId is preserved and sanitized
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
