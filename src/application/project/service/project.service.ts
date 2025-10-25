import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from '../dto/project.dto';
import { Project } from 'src/application/DB/entity/project.entity';
import { ProjectQuery } from 'src/application/DB/query/project.query';

@Injectable()
export class ProjectService {
  constructor(private readonly projectQuery: ProjectQuery) {}
  async createProject(
    user_id: string,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    return this.projectQuery.createProject(createProjectDto, user_id);
  }
}
