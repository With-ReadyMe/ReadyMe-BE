import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { TimelineDocument } from 'src/application/DB/entity/timeline.entity';
import { TimelineQuery } from 'src/application/DB/query/timeline.query';
import { ErrorCode } from 'src/core/exception/error-code';
import { GlobalException } from 'src/core/exception/global.exception';
import { WinstonLoggerService } from 'src/core/interceptors/logging/winston-logger.service';
import { CreateTimelineDto, UpdateTimelineDto } from '../dto/timeline.dto';

@Injectable()
export class TimelineService {
  constructor(
    private readonly timelineQuery: TimelineQuery,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createTimeline(
    userId: string,
    createTimelineDto: CreateTimelineDto,
  ): Promise<TimelineDocument> {
    try {
      this.logger.log(
        `Attempting to create timeline for user: ${userId} with type: ${createTimelineDto.type}`,
      );
      const timeline = await this.timelineQuery.createTimeline(
        userId,
        createTimelineDto,
      );
      this.logger.log('TimelineService.createTimeline success.');
      return timeline;
    } catch (error) {
      if (error instanceof GlobalException) {
        throw error;
      }
      this.logger.error(
        `TimelineService.createTimeline failed. User: ${userId}, Type: ${createTimelineDto.type}`,
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw new GlobalException(
        '타임라인 생성 중 알 수 없는 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.ERROR,
      );
    }
  }

  async updateTimeline(
    timelineId: string,
    userId: string,
    updateTimelineDto: UpdateTimelineDto,
  ): Promise<TimelineDocument> {
    try {
      this.logger.log(
        `Attempting to update timeline ID: ${timelineId} by user: ${userId}`,
      );
      const updatedTimeline = await this.timelineQuery.updateTimeline(
        timelineId,
        userId,
        updateTimelineDto,
      );

      if (!updatedTimeline) {
        this.logger.error(`Timeline not found with ID: ${timelineId}`);
        throw new GlobalException(
          '해당 ID의 타임라인을 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
          ErrorCode.NOT_UPDATE,
        );
      }

      this.logger.log('TimelineService.updateTimeline success.');
      return updatedTimeline;
    } catch (error) {
      if (error instanceof GlobalException) {
        throw error;
      }
      this.logger.error(
        `TimelineService.updateTimeline failed unexpectedly for Timeline ${timelineId}.`,
      );
      this.logger.error(error);

      throw new GlobalException(
        '타임라인을 업데이트하는 중 알 수 없는 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.ERROR,
      );
    }
  }

  async deleteTimeline(timelineId: string, userId: string): Promise<void> {
    try {
      this.logger.log(
        `Attempting to delete timeline ID: ${timelineId} by user: ${userId}`,
      );
      const deleteResult = await this.timelineQuery.deleteTimeline(
        timelineId,
        userId,
      );

      if (deleteResult.deletedCount === 0) {
        this.logger.warn(
          `Deletion failed: Timeline ${timelineId} not found or User ${userId} lacked permission.`,
        );

        throw new GlobalException(
          '해당 타임라인을 찾을 수 없거나 삭제 권한이 없습니다.',
          HttpStatus.FORBIDDEN,
          ErrorCode.USER_NOT_AUTHENTICATION,
        );
      }

      this.logger.log('TimelineService.deleteTimeline success.');
    } catch (error) {
      if (
        error instanceof GlobalException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `TimelineService.deleteTimeline failed unexpectedly for Timeline ${timelineId}.`,
      );
      this.logger.error(error);

      throw new GlobalException(
        '타임라인을 삭제하는 중 알 수 없는 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.ERROR,
      );
    }
  }

  async findAllByUserId(userId: string): Promise<TimelineDocument[]> {
    try {
      const timelines = await this.timelineQuery.findAllByUserId(userId);
      this.logger.log('TimelineService.findAllByUserId success.');
      return timelines;
    } catch (error) {
      if (error instanceof GlobalException) {
        throw error;
      }
      this.logger.error(
        `TimelineService.findAllByUserId failed. User: ${userId}`,
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw new GlobalException(
        '타임라인 조회 중 알 수 없는 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.ERROR,
      );
    }
  }
}
