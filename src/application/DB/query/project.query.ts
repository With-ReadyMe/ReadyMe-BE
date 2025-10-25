import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from '../entity/project.entity';
import { Model, Types } from 'mongoose';
import { CreateProjectDto } from 'src/application/project/dto/project.dto';

@Injectable()
export class ProjectQuery {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async createProject(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectDocument> {
    const projectData = {
      ...createProjectDto,
      userId: new Types.ObjectId(userId),
      other_links: createProjectDto.other_links || [],
    };
    const createdProject = new this.projectModel(projectData);

    return createdProject.save();
  }
}
