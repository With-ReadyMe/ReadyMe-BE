import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { DbModule } from 'src/application/DB/db.module';
import { WinstonLoggerService } from 'src/core/interceptors/logging/winston-logger.service';
import { JwtService } from '@nestjs/jwt';
import { JwtUtil } from 'src/core/utils/jwt';
import jwtConfig from 'src/config/jwt.config';

@Module({
  imports: [DbModule, ConfigModule.forFeature(jwtConfig)],
  controllers: [AuthController],
  providers: [WinstonLoggerService, JwtUtil, JwtService, AuthService],
})
export class AuthModule {}
