import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({
  timestamps: true,
})
export class Project {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: Number, required: true })
  dev_count: number;

  @Prop({ type: String })
  cover_url: string;

  @Prop({ type: String })
  archon_link: string;

  @Prop({
    type: String,
    enum: ['draft', 'processing', 'ready', 'error', 'archived'],
    default: 'draft',
    required: true,
  })
  status: string;

  @Prop({
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'private',
    required: true,
  })
  visibility: string;

  @Prop({ type: String })
  my_role: string;

  @Prop([String])
  other_links: string[];

  @Prop({ type: Date })
  period_start: Date;

  @Prop({ type: Date })
  period_end: Date;

  @Prop({ type: String })
  theme: string;

  @Prop({ type: String })
  markdown: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ status: 1, visibility: 1 });
ProjectSchema.index({ title: 1 });
