import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { AuthGuard } from '../../../core/guard/auth.guard';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { User, UserInfo } from 'src/core/guard/decorator/user.decorator';
import { ProjectDocument } from 'src/application/DB/entity/project.entity';

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

  @Get()
  async getProjects(@User() user: UserInfo): Promise<object> {
    const userId = user.id;

    const projects: ProjectDocument[] =
      await this.projectService.findUserProjects(userId);

    return {
      statusCode: HttpStatus.OK,
      message: '프로젝트 목록 조회 성공',
      data: projects,
    };
  }

  @Patch('/update/:projectId')
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @User() user: UserInfo,
  ) {
    const updatedProject = await this.projectService.updateProject(
      user.id,
      projectId,
      updateProjectDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: '프로젝트가 성공적으로 수정되었습니다.',
      data: updatedProject,
    };
  }
}
