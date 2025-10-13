import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './application/auth/auth.module';
import { DbModule } from './application/DB/db.module';
import { LoggingModule } from './core/interceptors/logging/logging.module';

@Module({
  imports: [
    // 환경 변수 전역 사용
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MongoDB 연결 설정 (비동기 방식)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),

    // 각 기능 모듈
    AuthModule,
    DbModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
