import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(AuthGuard('jwt'))
export class GoalsController {
    constructor(private readonly goalsService: GoalsService) { }

    @Get()
    async getChart(@Request() req: any) {
        return this.goalsService.getChart(req.user.userId);
    }

    @Put()
    async updateChart(@Request() req: any, @Body() data: any) {
        return this.goalsService.updateChart(req.user.userId, data);
    }
}
