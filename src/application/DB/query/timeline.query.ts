import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Timeline,
  TimelineDocument,
  TimelineType,
} from '../entity/timeline.entity';
import { DeleteResult, Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../entity/project.entity';
import {
  CreateTimelineDto,
  UpdateTimelineDto,
} from 'src/application/timeline/dto/timeline.dto';

@Injectable()
export class TimelineQuery {
  constructor(
    @InjectModel(Timeline.name) private timelineModel: Model<TimelineDocument>,
  ) {}
  async createTimeline(
    userId: string,
    createTimelineDto: CreateTimelineDto,
  ): Promise<TimelineDocument> {
    const createdTimeline = new this.timelineModel({
      user_id: new Types.ObjectId(userId),
      type: createTimelineDto.type,
      title: createTimelineDto.title,
      description: createTimelineDto.description || null,
      org: createTimelineDto.org || null,
      role: createTimelineDto.role || null,
      link_url: createTimelineDto.link_url || null,
      start_at: createTimelineDto.start_at,
      end_at: createTimelineDto.end_at || null,
    });

    return createdTimeline.save();
  }

  async updateTimeline(
    timelineId: string,
    userId: string,
    updateTimelineDto: UpdateTimelineDto,
  ): Promise<TimelineDocument> {
    const filter = {
      _id: new Types.ObjectId(timelineId),
      user_id: new Types.ObjectId(userId),
    };

    const updateData = {
      ...updateTimelineDto,
    };

    const updatedTimeline = await this.timelineModel // [2] await로 결과를 받음
      .findOneAndUpdate(filter, { $set: updateData }, { new: true })
      .exec();

    // [3] null 체크 로직 추가
    if (!updatedTimeline) {
      throw new Error( // 또는 NestJS의 NotFoundException
        `Timeline not found or user ${userId} does not have permission.`,
      );
    }

    // [4] null이 아님이 보장된 상태로 반환
    return updatedTimeline;
  }

  async deleteTimeline(
    timelineId: string,
    userId: string,
  ): Promise<DeleteResult> {
    return this.timelineModel.deleteOne({
      _id: new Types.ObjectId(timelineId),
      user_id: new Types.ObjectId(userId),
    });
  }
  async createTimelineForProject(
    userId: string,
    project: Project,
  ): Promise<TimelineDocument> {
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

  async deleteTimelineForProject(
    projectId: string,
    userId: string,
  ): Promise<void> {
    await this.timelineModel.deleteOne({
      'details.projectId': new Types.ObjectId(projectId),
      user_id: new Types.ObjectId(userId),
      type: TimelineType.PROJECT,
    });
  }

  async findAllByUserId(userId: string): Promise<TimelineDocument[]> {
    return this.timelineModel
      .find({ user_id: new Types.ObjectId(userId) })
      .sort({ start_at: 1, end_at: -1 })
      .exec();
  }
}
