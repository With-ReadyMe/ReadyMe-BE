import { Module } from '@nestjs/common';
import { DbModule } from '../DB/db.module';
import { ProjectController } from './controller/project.controller';
import { ProjectService } from './service/project.service';
import { JwtUtil } from 'src/core/utils/jwt';
import { WinstonLoggerService } from 'src/core/interceptors/logging/winston-logger.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';

@Module({
  imports: [DbModule, ConfigModule.forFeature(jwtConfig)],
  controllers: [ProjectController],
  providers: [ProjectService, JwtUtil, WinstonLoggerService, JwtService],
})
export class ProjectsModule {}
