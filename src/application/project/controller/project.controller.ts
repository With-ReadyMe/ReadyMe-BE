import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { AuthGuard } from '../../../core/guard/auth.guard';
import { CreateProjectDto } from '../dto/project.dto';
import { User, UserInfo } from 'src/core/guard/decorator/user.decorator';

@UseGuards(AuthGuard)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Post('/create')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @User() user: UserInfo,
  ) {
    const user_id = user.id;

    if (!user_id) {
      throw new UnauthorizedException('인증된 사용자 ID를 찾을 수 없습니다.');
    }
    const project = await this.projectService.createProject(
      user_id,
      createProjectDto,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: '프로젝트가 성공적으로 등록되었습니다.',
      data: project,
    };
  }
}
