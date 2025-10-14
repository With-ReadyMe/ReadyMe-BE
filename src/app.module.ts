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

    // MongoDB 연결 설정
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DB'),
      }),
    }),

    LoggingModule,
    AuthModule,
    DbModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
