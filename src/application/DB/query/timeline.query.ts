import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Timeline,
  TimelineDocument,
  TimelineType,
} from '../entity/timeline.entity';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../entity/project.entity';

@Injectable()
export class TimelineQuery {
  constructor(
    @InjectModel(Timeline.name) private timelineModel: Model<TimelineDocument>,
  ) {}
  async createTimelineForProject(
    userId: string,
    project: Project,
  ): Promise<Timeline> {
    const createdTimeline = new this.timelineModel({
      user_id: new Types.ObjectId(userId),
      type: TimelineType.PROJECT,
      title: project.title,

      org: null, // 수상기관
      role: project.my_role,
      link_url: project.archon_link || null,

      details: {
        dev_count: project.dev_count,
        other_links: project.other_links || [],
      },
      start_at: project.period_start,
      end_at: project.period_end || null,
    });

    return createdTimeline.save();
  }
  async updateTimelineForProject(
    project: ProjectDocument,
  ): Promise<TimelineDocument> {
    const filter = {
      'details.projectId': project._id,
      user_id: project.user_id,
      type: TimelineType.PROJECT,
    };

    const updateData = {
      title: project.title,

      org: null,

      role: project.my_role,

      link_url: project.archon_link || null,

      details: {
        projectId: project._id,
        dev_count: project.dev_count,
        other_links: project.other_links || [],
      },

      start_at: project.period_start,
      end_at: project.period_end || null,
      updated_at: new Date(),
    };

    const updatedTimeline = await this.timelineModel
      .findOneAndUpdate(filter, { $set: updateData }, { new: true })
      .exec();

    if (!updatedTimeline) {
      throw new Error('Timeline not found');
    }

    return updatedTimeline;
  }
}
