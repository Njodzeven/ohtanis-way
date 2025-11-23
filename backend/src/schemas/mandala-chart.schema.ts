import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MandalaChartDocument = MandalaChart & Document;

@Schema()
class Task {
    @Prop()
    id: string;

    @Prop()
    content: string;
}

@Schema()
class Pillar {
    @Prop()
    id: string;

    @Prop()
    content: string;

    @Prop([Task])
    tasks: Task[];
}

@Schema({ timestamps: true })
export class MandalaChart {
    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ type: Object })
    center: { id: string; content: string };

    @Prop([Pillar])
    pillars: Pillar[];
}

export const MandalaChartSchema = SchemaFactory.createForClass(MandalaChart);
