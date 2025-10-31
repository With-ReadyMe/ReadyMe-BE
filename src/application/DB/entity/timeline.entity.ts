import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimelineDocument = Timeline & Document;

export enum TimelineType {
  PROJECT = 'project',
  AWARD = 'award',
  CAREER = 'career',
  EDUCATION = 'education',
  CUSTOM = 'custom',
}

@Schema({
  timestamps: true,
})
export class Timeline {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TimelineType),
    default: TimelineType.CUSTOM,
  })
  type: TimelineType;

  @Prop({ type: String, required: false })
  title: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: false })
  org: string;

  @Prop({ type: String, required: false })
  role: string;

  @Prop({ type: String, required: false })
  link_url: string;

  @Prop({ type: Object, required: false })
  details: Record<string, any>;

  @Prop({ type: Date, required: true })
  start_at: Date;

  @Prop({ type: Date, required: false })
  end_at?: Date;
}

export const TimelineSchema = SchemaFactory.createForClass(Timeline);

TimelineSchema.index({ user_id: 1, start_at: -1 });

TimelineSchema.index({ type: 1 });
