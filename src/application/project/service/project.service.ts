import {
  ForbiddenException,
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

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectQuery: ProjectQuery,
    private readonly timelineQuery: TimelineQuery,
  ) {}
  async createProject(
    user_id: string,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const project: ProjectDocument = await this.projectQuery.createProject(
      createProjectDto,
      user_id,
    );

    await this.timelineQuery.createTimelineForProject(user_id, project);

    return project;
  }

  async findUserProjects(userId: string): Promise<ProjectDocument[]> {
    const projects = await this.projectQuery.findProjectsByUserId(userId);
    return projects;
  }

  async updateProject(
    userId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const project = await this.projectQuery.findById(projectId);
    if (!project) {
      throw new NotFoundException('해당 ID의 프로젝트를 찾을 수 없습니다.');
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
    const project = await this.projectQuery.findById(projectId);

    if (!project) {
      throw new NotFoundException('해당 ID의 프로젝트를 찾을 수 없습니다.');
    }

    const isOwner = userId !== null && project.user_id.toHexString() === userId;

    if (
      !isOwner &&
      (project.visibility === 'private' || project.visibility === 'unlisted')
    ) {
      throw new ForbiddenException('해당 프로젝트를 조회할 권한이 없습니다.');
    }

    return project;
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const deleteResult: DeleteResult = await this.projectQuery.deleteProject(
      projectId,
      userId,
    );

    if (deleteResult.deletedCount === 0) {
      throw new NotFoundException(
        '해당 프로젝트를 찾을 수 없거나 삭제 권한이 없습니다.',
      );
    }

    try {
      await this.timelineQuery.deleteTimelineForProject(projectId, userId);
    } catch (error) {
      console.error(
        `[Timeline Sync ERROR] Failed to delete timeline for Project ID: ${projectId}`,
        error,
      );
    }
    return;
  }
}
