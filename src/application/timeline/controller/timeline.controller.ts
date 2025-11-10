import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { TimelineService } from '../service/timeline.service';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { User, UserInfo } from 'src/core/guard/decorator/user.decorator';
import { JsonResponse } from 'src/core/utils/json-response';
import { CreateTimelineDto, UpdateTimelineDto } from '../dto/timeline.dto';

@UseGuards(AuthGuard)
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post()
  async createTimeline(
    @Body() createTimelineDto: CreateTimelineDto,
    @User() user: UserInfo,
  ) {
    const userId = user.id;

    if (!userId) {
      throw new UnauthorizedException('인증된 사용자 ID를 찾을 수 없습니다.');
    }

    const timeline = await this.timelineService.createTimeline(
      userId,
      createTimelineDto,
    );

    const response = new JsonResponse();
    response.set('data', timeline);
    response.set('statusCode', HttpStatus.CREATED);
    response.set('message', '타임라인이 성공적으로 생성되었습니다.');

    return response.of();
  }

  @Patch('/:timelineId')
  async updateTimeline(
    @Param('timelineId') timelineId: string,
    @Body() updateTimelineDto: UpdateTimelineDto,
    @User() user: UserInfo,
  ) {
    const updatedTimeline = await this.timelineService.updateTimeline(
      timelineId,
      user.id,
      updateTimelineDto,
    );

    const response = new JsonResponse();
    response.set('data', updatedTimeline);
    response.set('statusCode', HttpStatus.OK);
    response.set('message', '타임라인이 성공적으로 수정되었습니다.');

    return response.of();
  }

  @Delete('/:timelineId')
  async deleteTimeline(
    @Param('timelineId') timelineId: string,
    @User() user: UserInfo,
  ) {
    await this.timelineService.deleteTimeline(timelineId, user.id);

    const response = new JsonResponse();
    response.set('statusCode', HttpStatus.NO_CONTENT);
    response.set('message', '타임라인이 성공적으로 삭제되었습니다.');

    return response.of();
  }

  @Get()
  async getTimelines(@User() user: UserInfo) {
    const userId = user.id;

    const timelines = await this.timelineService.findAllByUserId(userId);
    const response = new JsonResponse();
    response.set('data', timelines);
    response.set('statusCode', HttpStatus.OK);
    response.set('message', '타임라인 목록 조회 성공');
    return response.of();
  }
}
