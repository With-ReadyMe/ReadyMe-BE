import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import {
  Project,
  ProjectDocument,
} from 'src/application/DB/entity/project.entity';
import { ProjectQuery } from 'src/application/DB/query/project.query';
import { TimelineQuery } from 'src/application/DB/query/timeline.query';
import { DeleteResult } from 'mongoose';
import { GlobalException } from 'src/core/exception/global.exception';
import { ErrorCode } from 'src/core/exception/error-code';
import { WinstonLoggerService } from 'src/core/interceptors/logging/winston-logger.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectQuery: ProjectQuery,
    private readonly logger: WinstonLoggerService,
    private readonly timelineQuery: TimelineQuery,
  ) {}
  async createProject(
    user_id: string,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    try {
      const project: ProjectDocument = await this.projectQuery.createProject(
        createProjectDto,
        user_id,
      );

      try {
        await this.timelineQuery.createTimelineForProject(user_id, project);
        this.logger.log(
          `Timeline successfully created for new Project ID: ${String(project._id)}`,
        );
      } catch (timelineError) {
        this.logger.warn(
          `[Timeline Sync WARN] Failed to create timeline for new Project ID: ${String(project._id)}. Project creation proceeded.`,
        );
        this.logger.error(timelineError);
      }

      this.logger.log('ProjectService.createProject success.');
      return project;
    } catch (error) {
      if (error instanceof GlobalException) {
        throw error;
      }
      this.logger.error(
        'ProjectService.createProject failed due to DB or internal error.',
      );
      this.logger.error(error);

      throw new GlobalException(
        '프로젝트 생성 중 알 수 없는 오류가 발생했습니다.',

        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.ERROR,
      );
    }
  }

  async findUserProjects(userId: string): Promise<ProjectDocument[]> {
    try {
      this.logger.log(`Attempting to find projects for user: ${userId}`);

      const projects = await this.projectQuery.findProjectsByUserId(userId);

      this.logger.log('ProjectService.findUserProjects success.');
      return projects;
    } catch (error) {
      if (error instanceof GlobalException) {
        throw error;
      }

      this.logger.error(
        `ProjectService.findUserProjects failed for user ${userId}.`,
      );
      this.logger.error(error);

      throw new GlobalException(
        '사용자의 프로젝트 목록을 조회하는 중 알 수 없는 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.ERROR,
      );
    }
  }

  async updateProject(
    userId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const project = await this.projectQuery.findById(projectId);
    if (!project) {
      throw new GlobalException(
        '해당 ID의 프로젝트를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_UPDATE,
      );
    }
    const updatedProject = await this.projectQuery.updateProject(
      projectId,
      updateProjectDto,
    );

    if (!updatedProject) {
      throw new NotFoundException('해당 ID의 프로젝트를 찾을 수 없습니다.');
    }

    try {
      const updatedTimeline =
        await this.timelineQuery.updateTimelineForProject(updatedProject);

      if (!updatedTimeline) {
        console.warn(
          `[Timeline Sync WARN] Timeline not found for Project ID: ${projectId}. Skipping update.`,
        );
      } else {
        console.log(
          `[Timeline Sync INFO] Timeline successfully updated for Project ID: ${projectId}.`,
        );
      }
    } catch (error) {
      console.error(
        `[Timeline Sync ERROR] Failed to update timeline for Project ID: ${projectId}`,
        error,
      );
    }

    return updatedProject;
  }

  async getProjectDetail(
    userId: string | null,
    projectId: string,
  ): Promise<ProjectDocument> {
    try {
      this.logger.log(
        `Attempting to get project detail for ID: ${projectId} by user: ${userId}`,
      );

      const project = await this.projectQuery.findById(projectId);

      if (!project) {
        this.logger.error(`Project not found with ID: ${projectId}`);
        throw new GlobalException(
          '해당 ID의 프로젝트를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
          ErrorCode.NULL_OBJECT,
        );
      }

      const isOwner =
        userId !== null && project.user_id.toHexString() === userId;

      if (
        !isOwner &&
        (project.visibility === 'private' || project.visibility === 'unlisted')
      ) {
        this.logger.warn(
          `Unauthorized access attempt on Project ${projectId} by User ${userId}`,
        );
        throw new GlobalException(
          '해당 프로젝트를 조회할 권한이 없습니다.',
          HttpStatus.FORBIDDEN,
          ErrorCode.USER_NOT_AUTHENTICATION, // FORBIDDEN_PROJECT_ACCESS 코드가 있다고 가정
        );
      }

      this.logger.log('ProjectService.getProjectDetail success.');
      return project;
    } catch (error) {
      if (
        error instanceof GlobalException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `ProjectService.getProjectDetail failed unexpectedly for Project ${projectId}.`,
      );
      this.logger.error(error);

      throw new GlobalException(
        '프로젝트 상세 정보를 조회하는 중 알 수 없는 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.ERROR,
      );
    }
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    try {
      this.logger.log(
        `Attempting to delete project ID: ${projectId} by user: ${userId}`,
      );

      const deleteResult: DeleteResult = await this.projectQuery.deleteProject(
        projectId,
        userId,
      );

      if (deleteResult.deletedCount === 0) {
        this.logger.warn(
          `Deletion failed: Project ${projectId} not found or User ${userId} lacked permission.`,
        );

        throw new GlobalException(
          '해당 프로젝트를 찾을 수 없거나 삭제 권한이 없습니다.',
          HttpStatus.FORBIDDEN,

          ErrorCode.USER_NOT_AUTHENTICATION,
        );
      }

      try {
        await this.timelineQuery.deleteTimelineForProject(projectId, userId);
        this.logger.log(
          `Timeline successfully deleted for Project ID: ${projectId}`,
        );
      } catch (timelineError) {
        this.logger.error(
          `[Timeline Sync ERROR] Failed to delete timeline for Project ID: ${projectId}`,
        );
        this.logger.error(timelineError);
      }

      this.logger.log('ProjectService.deleteProject success.');
      return;
    } catch (error) {
      if (
        error instanceof GlobalException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `ProjectService.deleteProject failed unexpectedly for Project ${projectId}.`,
      );
      this.logger.error(error);

      throw new GlobalException(
        '프로젝트를 삭제하는 중 알 수 없는 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.ERROR,
      );
    }
  }
}
