import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from '../entity/project.entity';
import { Model, Types } from 'mongoose';
import {
  CreateProjectDto,
  UpdateProjectDto,
} from 'src/application/project/dto/project.dto';

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

  async findProjectsByUserId(user_id: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ user_id: new Types.ObjectId(user_id) })
      .sort({ created_at: -1 })
      .exec();
  }

  async findById(projectId: string): Promise<ProjectDocument | null> {
    return this.projectModel.findById(new Types.ObjectId(projectId)).exec();
  }

  async updateProject(
    projectId: string,
    updateData: UpdateProjectDto,
  ): Promise<ProjectDocument | null> {
    const project = await this.projectModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(projectId) },
        { $set: updateData },
        { new: true },
      )
      .exec();

    return project;
  }

  async findByIdAndUserId(
    projectId: string,
    userId: string,
  ): Promise<ProjectDocument | null> {
    return this.projectModel
      .findOne({
        _id: new Types.ObjectId(projectId),
        user_id: new Types.ObjectId(userId),
      })
      .exec();
  }
}
