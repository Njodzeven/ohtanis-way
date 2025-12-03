import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ChartsService } from './charts.service';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { CreateChartDto, UpdateChartDto } from './dto/charts.dto';

@Controller('charts')
export class ChartsController {
    constructor(private readonly chartsService: ChartsService) { }

    /**
     * Create chart - supports both guest and authenticated users
     * Guest users can create charts but they won't be saved to history
     * Authenticated users get charts saved
     */
    @Post()
    @UseGuards(OptionalAuthGuard)
    @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 chart creations per minute
    create(@Request() req: any, @Body() createChartDto: CreateChartDto) {
        // If user is authenticated (has req.user), save the chart
        if (req.user?.userId) {
            return this.chartsService.create(req.user.userId, createChartDto.title, createChartDto.data);
        }

        // Guest user - return chart data without saving
        return {
            message: 'Chart created (not saved - please login to save charts)',
            chart: {
                title: createChartDto.title,
                data: createChartDto.data,
            },
        };
    }

    /**
     * Get all charts - requires authentication
     * Only authenticated users can view their chart history
     */
    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll(@Request() req: any) {
        return this.chartsService.findAll(req.user.userId);
    }

    /**
     * Get specific chart - requires authentication
     */
    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.chartsService.findOne(id, req.user.userId);
    }

    /**
     * Update chart - requires authentication
     */
    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Request() req: any, @Param('id') id: string, @Body() updateChartDto: UpdateChartDto) {
        return this.chartsService.update(id, req.user.userId, updateChartDto);
    }

    /**
     * Delete chart - requires authentication
     */
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    remove(@Request() req: any, @Param('id') id: string) {
        return this.chartsService.remove(id, req.user.userId);
    }
}
