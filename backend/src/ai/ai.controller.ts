import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('analyze')
    async analyze(@Body('goal') goal: string) {
        return this.aiService.analyzeGoal(goal);
    }
}
