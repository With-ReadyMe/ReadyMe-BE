import { Module } from '@nestjs/common';
import { DbModule } from '../DB/db.module';
import { JwtUtil } from 'src/core/utils/jwt';
import { WinstonLoggerService } from 'src/core/interceptors/logging/winston-logger.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import { PublicController } from './controller/public.controller';
import { PublicService } from './service/public.service';

@Module({
  imports: [DbModule, ConfigModule.forFeature(jwtConfig)],
  controllers: [PublicController],
  providers: [PublicService, JwtUtil, WinstonLoggerService, JwtService],
})
export class PublicModule {}
