import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './application/auth/auth.module';
import { UsersModule } from './application/DB/users/users.module';

@Module({
  imports: [
    // 2. ConfigModule을 전역(Global)으로 설정하여 어디서든 환경 변수에 접근 가능하게 함
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 3. MongooseModule에 forRootAsync 적용
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService], // ConfigService 주입
    }),

    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
