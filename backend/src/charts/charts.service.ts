import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ChartsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, title: string, data: any) {
        return this.prisma.chart.create({
            data: {
                title,
                data,
                userId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.chart.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const chart = await this.prisma.chart.findUnique({
            where: { id },
        });

        if (!chart) {
            throw new NotFoundException('Chart not found');
        }

        if (chart.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return chart;
    }

    async update(id: string, userId: string, data: { title?: string; data?: any }) {
        // Check ownership first
        await this.findOne(id, userId);

        return this.prisma.chart.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    async remove(id: string, userId: string) {
        // Check ownership first
        await this.findOne(id, userId);

        return this.prisma.chart.delete({
            where: { id },
        });
    }
}
