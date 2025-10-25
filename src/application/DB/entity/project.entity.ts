import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectsDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: Number })
  dev_count: number;

  @Prop()
  my_role: string;

  @Prop()
  archon_link: string;

  @Prop([String])
  other_links: string[];

  @Prop({ type: Date })
  period_start: Date;

  @Prop({ type: Date })
  period_end: Date;

  @Prop()
  thumbnail_url: string;

  @Prop()
  theme: string;

  @Prop()
  markdown: string;

  @Prop()
  visibility: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
