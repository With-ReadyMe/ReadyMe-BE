import { Module } from '@nestjs/common';
import { DbModule } from '../DB/db.module';
import { JwtUtil } from 'src/core/utils/jwt';
import { WinstonLoggerService } from 'src/core/interceptors/logging/winston-logger.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import { TimelineController } from './controller/timeline.controller';
import { TimelineService } from './service/timeline.service';

@Module({
  imports: [DbModule, ConfigModule.forFeature(jwtConfig)],
  controllers: [TimelineController],
  providers: [TimelineService, JwtUtil, WinstonLoggerService, JwtService],
})
export class TimelineModule {}
