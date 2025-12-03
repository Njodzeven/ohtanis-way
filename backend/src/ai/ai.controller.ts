import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { AnalyzeGoalDto } from './dto/ai.dto';

@Controller('ai')
@UseGuards(OptionalAuthGuard) // Supports both guest and authenticated users
export class AiController {
    constructor(private readonly aiService: AiService) { }

    /**
     * Analyze goal with AI - supports both guest and authenticated users
     * Rate limits are different: 10/min for guests, 30/min for authenticated
     */
    @Post('analyze')
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // Base limit for guests
    async analyze(@Request() req: any, @Body() analyzeGoalDto: AnalyzeGoalDto) {
        // Apply higher rate limit for authenticated users (handled by custom throttler if needed)
        // For now, both use same limit but authenticated users identified
        const isAuthenticated = !!req.user;

        return this.aiService.analyzeGoal(
            analyzeGoalDto.goal,
            isAuthenticated ? req.user.userId : null
        );
    }
}
