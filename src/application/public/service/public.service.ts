import { Injectable } from '@nestjs/common';
import { ProjectDocument } from 'src/application/DB/entity/project.entity';
import { ProjectQuery } from 'src/application/DB/query/project.query';

@Injectable()
export class PublicService {
  constructor(private readonly projectQuery: ProjectQuery) {}
  async getPublicProjects(): Promise<ProjectDocument[]> {
    return this.projectQuery.findPublicProjects();
  }
}
