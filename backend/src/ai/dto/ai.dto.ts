import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AnalyzeGoalDto {
    @IsString()
    @IsNotEmpty({ message: 'Goal cannot be empty' })
    @MinLength(3, { message: 'Goal must be at least 3 characters long' })
    @MaxLength(500, { message: 'Goal must not exceed 500 characters' })
    @Transform(({ value }) => value?.trim()) // Sanitize whitespace
    goal: string;
}
