import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entity/user.entity';
import { UserQuery } from './query/user.query';
import { Project, ProjectSchema } from './entity/project.entity';
import { ProjectQuery } from './query/project.query';
import { Timeline, TimelineSchema } from './entity/timeline.entity';
import { TimelineQuery } from './query/timeline.query';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Timeline.name, schema: TimelineSchema },
    ]),
  ],
  providers: [UserQuery, ProjectQuery, TimelineQuery],
  exports: [UserQuery, ProjectQuery, TimelineQuery],
})
export class DbModule {}
