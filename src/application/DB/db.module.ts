import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entity/user.entity';
import { UserQuery } from './query/user.query';
import { Project, ProjectSchema } from './entity/project.entity';
import { ProjectQuery } from './query/project.query';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  providers: [UserQuery, ProjectQuery],
  exports: [UserQuery, ProjectQuery],
})
export class DbModule {}
