import { Module } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { WinstonLoggerService } from './winston-logger.service';
import { GlobalExceptionFilter } from '../../filter/global.filter';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    WinstonLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [WinstonLoggerService],
})
export class LoggingModule {}
