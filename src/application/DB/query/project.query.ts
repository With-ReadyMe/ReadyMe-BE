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
    user_id: string,
  ): Promise<ProjectDocument> {
    const projectData = {
      ...createProjectDto,
      user_id: new Types.ObjectId(user_id),
      other_links: createProjectDto.other_links || [],
    };
    const createdProject = new this.projectModel(projectData);

    return createdProject.save();
  }
}
