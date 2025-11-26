import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(
        private readonly configService: ConfigService,
    ) { }

    async analyzeGoal(goal: string): Promise<any> {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.error('Gemini API Key not configured');
            throw new HttpException('AI Service configuration error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const requestBody = {
            systemInstruction: {
                parts: [{
                    text: "You are an expert coach in the Harada Method and Shohei Ohtani's Mandala Chart (Open Window 64). Your task is to take a main goal and generate a complete 9x9 Mandala Chart structure. This involves defining 8 supporting pillars (balanced across skill, body, mind, and life) and for EACH pillar, exactly 8 specific, actionable daily habits or tasks. The tasks must be concrete actions (e.g., 'Read 10 pages' instead of 'Read more'). Output ONLY valid JSON."
                }]
            },
            contents: [{
                parts: [{
                    text: `Main Goal: "${goal}". Generate the full Open Window 64 Mandala Chart. Return a JSON object with a 'center_goal' and a 'pillars' array. Each pillar must have a 'title' and a 'tasks' array containing exactly 8 strings. Ensure the tasks are highly specific and actionable.`
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        center_goal: { type: "STRING" },
                        pillars: {
                            type: "ARRAY",
                            minItems: 8,
                            maxItems: 8,
                            items: {
                                type: "OBJECT",
                                properties: {
                                    title: { type: "STRING", description: "Pillar title" },
                                    tasks: {
                                        type: "ARRAY",
                                        minItems: 8,
                                        maxItems: 8,
                                        items: { type: "STRING", description: "Specific actionable task" }
                                    }
                                },
                                required: ["title", "tasks"]
                            }
                        }
                    },
                    required: ["center_goal", "pillars"]
                }
            }
        };

        try {
            const response = await axios.post(
                url,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
                throw new Error('Invalid response format from Gemini API');
            }

            return JSON.parse(content);
        } catch (error: any) {
            this.logger.error(`AI Service Error: ${error.message}`, error.response?.data);

            throw new HttpException(
                {
                    message: error.response?.data?.error?.message || 'Failed to connect to AI Service',
                    status: error.response?.status,
                },
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
