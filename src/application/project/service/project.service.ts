import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from '../dto/project.dto';
import {
  Project,
  ProjectDocument,
} from 'src/application/DB/entity/project.entity';
import { ProjectQuery } from 'src/application/DB/query/project.query';
import { TimelineQuery } from 'src/application/DB/query/timeline.query';

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
}
