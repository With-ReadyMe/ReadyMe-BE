import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { WinstonLoggerService } from './winston-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, body, headers, cookies, hostname } = request;

    // 요청 로깅
    this.logger.requestLog(method, url, {
      host: hostname,
      headers,
      cookies,
      body,
    });

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          // 성공 응답 로깅
          this.logger.responseLog(
            method,
            url,
            statusCode,
            responseBody,
            responseTime,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode || 500;

          this.logger.responseLog(method, url, statusCode, null, responseTime);
        },
      }),
    );
  }
}
