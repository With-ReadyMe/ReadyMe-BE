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
import { ProjectService } from '../service/project.service';
import { AuthGuard } from '../../../core/guard/auth.guard';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { User, UserInfo } from 'src/core/guard/decorator/user.decorator';
import { ProjectDocument } from 'src/application/DB/entity/project.entity';
import { JsonResponse } from 'src/core/utils/json-response';

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
    const response = new JsonResponse();
    response.set('data', project);

    response.set('statusCode', HttpStatus.CREATED);
    response.set('message', '프로젝트가 성공적으로 등록되었습니다.');

    return response.of();
  }

  @Get()
  async getProjects(@User() user: UserInfo) {
    const userId = user.id;

    const projects: ProjectDocument[] =
      await this.projectService.findUserProjects(userId);

    const response = new JsonResponse();
    response.set('data', projects);
    response.set('statusCode', HttpStatus.OK);
    response.set('message', '프로젝트 목록 조회 성공');

    return response.of();
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

    const response = new JsonResponse();
    response.set('data', updatedProject);
    response.set('statusCode', HttpStatus.OK);
    response.set('message', '프로젝트가 성공적으로 수정되었습니다.');

    return response.of();
  }

  @Get('/:projectId')
  async getProjectById(
    @Param('projectId') projectId: string,
    @User() user: UserInfo,
  ) {
    const project = await this.projectService.getProjectDetail(
      user.id,
      projectId,
    );

    const response = new JsonResponse();
    response.set('data', project);
    response.set('statusCode', HttpStatus.OK);
    response.set('message', '프로젝트 조회 성공');

    return response.of();
  }

  @Delete('/:projectId')
  async deleteProject(
    @Param('projectId') projectId: string,
    @User() user: UserInfo,
  ) {
    await this.projectService.deleteProject(user.id, projectId);

    const response = new JsonResponse();
    response.set('statusCode', HttpStatus.NO_CONTENT);
    response.set('message', '프로젝트가 성공적으로 삭제되었습니다.');

    return response.of();
  }
}
