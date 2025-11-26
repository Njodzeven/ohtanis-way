import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('analyze')
    async analyze(@Body('goal') goal: string) {
        return this.aiService.analyzeGoal(goal);
    }
}
